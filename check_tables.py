"""Verify the loan application table and Supabase Auth trigger are installed."""

from database import get_connection


def main() -> None:
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT to_regclass('public.loan_applications');")
                table_name = cursor.fetchone()[0]
                if table_name != "loan_applications":
                    raise RuntimeError("Table public.loan_applications was not found.")

                cursor.execute(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM pg_trigger trigger_info
                        JOIN pg_class table_info ON table_info.oid = trigger_info.tgrelid
                        JOIN pg_namespace table_schema ON table_schema.oid = table_info.relnamespace
                        WHERE trigger_info.tgname = 'on_auth_user_created_loan_application'
                          AND table_schema.nspname = 'auth'
                          AND table_info.relname = 'users'
                          AND NOT trigger_info.tgisinternal
                    );
                    """
                )
                trigger_exists = cursor.fetchone()[0]
                if not trigger_exists:
                    raise RuntimeError("Auth signup trigger was not found.")

        print("Table found: public.loan_applications")
        print("Trigger found: auth.users -> public.loan_applications")
    except Exception as error:
        print(f"Database check failed: {error}")
        raise


if __name__ == "__main__":
    main()