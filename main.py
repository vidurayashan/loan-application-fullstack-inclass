"""FastAPI backend for the loan application service."""

import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import get_connection, initialize_database

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


class SignUpRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    first_name: str = ""
    last_name: str = ""


class SignInRequest(BaseModel):
    email: str
    password: str


class LoanApplicationRequest(BaseModel):
    first_name: str = Field(min_length=2, max_length=100)
    last_name: str = Field(min_length=2, max_length=100)
    email_address: str = Field(min_length=3, max_length=255)
    phone_number: str = Field(min_length=10, max_length=50)
    loan_amount: float = Field(gt=0, le=100000)
    loan_term: int = Field(gt=0, le=360)
    loan_purpose: str = Field(min_length=1, max_length=100)


class LoanApplicationDraftRequest(BaseModel):
    first_name: str | None = Field(default=None, min_length=2, max_length=100)
    last_name: str | None = Field(default=None, min_length=2, max_length=100)
    email_address: str | None = Field(default=None, min_length=3, max_length=255)
    phone_number: str | None = Field(default=None, min_length=10, max_length=50)
    loan_amount: float | None = Field(default=None, gt=0, le=100000)
    loan_term: int | None = Field(default=None, gt=0, le=360)
    loan_purpose: str | None = Field(default=None, min_length=1, max_length=100)


def get_supabase_config() -> tuple[str, str]:
    supabase_url = os.getenv("SUPABASE_URL")
    publishable_key = os.getenv("SUPABASE_PUBLISHABLE_KEY")
    if not supabase_url or not publishable_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase Auth configuration is missing.",
        )
    return supabase_url.rstrip("/"), publishable_key


def supabase_auth_request(path: str, payload: dict) -> dict:
    """Call Supabase Auth without logging credentials, tokens, or passwords."""
    supabase_url, publishable_key = get_supabase_config()

    request = Request(
        url=f"{supabase_url.rstrip('/')}/auth/v1/{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "apikey": publishable_key,
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=15) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        try:
            response_body = json.loads(error.read().decode("utf-8"))
            detail = response_body.get("msg") or response_body.get("message") or "Authentication failed."
        except (json.JSONDecodeError, UnicodeDecodeError):
            detail = "Authentication failed."
        raise HTTPException(status_code=error.code, detail=detail) from error
    except URLError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach Supabase Auth.",
        ) from error


def get_authenticated_user_id(authorization: str | None) -> str:
    """Verify a Supabase access token and return its authenticated user ID."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="A Bearer access token is required.")

    supabase_url, publishable_key = get_supabase_config()
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="A Bearer access token is required.")

    request = Request(
        url=f"{supabase_url}/auth/v1/user",
        headers={"apikey": publishable_key, "Authorization": f"Bearer {token}"},
        method="GET",
    )
    try:
        with urlopen(request, timeout=15) as response:
            user = json.loads(response.read().decode("utf-8"))
        user_id = user.get("id")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token.")
        return user_id
    except HTTPError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token.") from error
    except URLError as error:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Unable to verify authentication.") from error


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(title="Loan Application API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Loan Application API is running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.post("/auth/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignUpRequest) -> dict:
    return supabase_auth_request(
        "signup",
        {
            "email": str(payload.email),
            "password": payload.password,
            "data": {"first_name": payload.first_name, "last_name": payload.last_name},
        },
    )


@app.post("/auth/signin")
def signin(payload: SignInRequest) -> dict:
    return supabase_auth_request(
        "token?grant_type=password",
        {"email": str(payload.email), "password": payload.password},
    )


@app.get("/loan-applications/me")
def get_my_loan_application(authorization: str | None = Header(default=None)) -> dict:
    user_id = get_authenticated_user_id(authorization)
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT first_name, last_name, email_address, phone_number,
                       loan_amount, loan_term, loan_purpose
                FROM public.loan_applications
                WHERE id = %s;
                """,
                (user_id,),
            )
            application = cursor.fetchone()
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan application not found.")
    columns = ("first_name", "last_name", "email_address", "phone_number", "loan_amount", "loan_term", "loan_purpose")
    return dict(zip(columns, application))


@app.put("/loan-applications/me")
def update_my_loan_application(
    payload: LoanApplicationRequest,
    authorization: str | None = Header(default=None),
) -> dict:
    user_id = get_authenticated_user_id(authorization)
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE public.loan_applications
                SET first_name = %s,
                    last_name = %s,
                    email_address = %s,
                    phone_number = %s,
                    loan_amount = %s,
                    loan_term = %s,
                    loan_purpose = %s
                WHERE id = %s
                RETURNING id, updated_at;
                """,
                (
                    payload.first_name.strip(), payload.last_name.strip(), payload.email_address.strip(),
                    payload.phone_number.strip(), payload.loan_amount, payload.loan_term,
                    payload.loan_purpose.strip(), user_id,
                ),
            )
            updated_application = cursor.fetchone()
    if updated_application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan application not found.")
    return {"message": "Loan application saved successfully", "id": str(updated_application[0])}


@app.patch("/loan-applications/me")
def save_my_loan_application_draft(
    payload: LoanApplicationDraftRequest,
    authorization: str | None = Header(default=None),
) -> dict:
    """Persist only supplied draft fields for the authenticated user's application."""
    user_id = get_authenticated_user_id(authorization)
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one draft field is required.")

    allowed_columns = {
        "first_name", "last_name", "email_address", "phone_number",
        "loan_amount", "loan_term", "loan_purpose",
    }
    assignments: list[str] = []
    values: list[str | float | int] = []
    for column, value in updates.items():
        if column not in allowed_columns:
            continue
        assignments.append(f"{column} = %s")
        values.append(value.strip() if isinstance(value, str) else value)

    values.append(user_id)
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                UPDATE public.loan_applications
                SET {', '.join(assignments)}
                WHERE id = %s
                RETURNING id;
                """,
                values,
            )
            updated_application = cursor.fetchone()
    if updated_application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan application not found.")
    return {"message": "Loan application draft saved", "id": str(updated_application[0])}