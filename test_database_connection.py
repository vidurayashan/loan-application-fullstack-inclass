"""Verify Supabase PostgreSQL connectivity without exposing credentials."""

from database import get_connection


def main() -> None:
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()
        print("Database connection successful")
    except Exception as error:
        print(f"Database connection failed: {error}")
        raise


if __name__ == "__main__":
    main()