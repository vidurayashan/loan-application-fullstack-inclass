"""Supabase PostgreSQL connection and schema initialization helpers."""

import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def get_database_url() -> str:
    """Return DATABASE_URL without ever logging its sensitive contents."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not configured. Add it to the .env file.")
    return database_url


def get_connection():
    """Open an SSL-protected connection to the Supabase PostgreSQL database."""
    return psycopg2.connect(get_database_url(), sslmode="require")


def initialize_database() -> None:
    """Run the idempotent schema setup SQL."""
    schema_sql = (BASE_DIR / "schema.sql").read_text(encoding="utf-8")
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(schema_sql)


if __name__ == "__main__":
    try:
        initialize_database()
        print("Database initialization completed successfully")
    except Exception as error:
        print(f"Database initialization failed: {error}")
        raise