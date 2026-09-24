-- Loan application schema and Supabase Auth signup trigger.
-- This script is intentionally idempotent and can safely be run more than once.

CREATE TABLE IF NOT EXISTS public.loan_applications (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    email_address TEXT NOT NULL DEFAULT '',
    phone_number TEXT NOT NULL DEFAULT '',
    loan_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (loan_amount >= 0),
    loan_term INTEGER NOT NULL DEFAULT 0 CHECK (loan_term >= 0),
    loan_purpose TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own loan application" ON public.loan_applications;
CREATE POLICY "Users can view their own loan application"
ON public.loan_applications FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own loan application" ON public.loan_applications;
CREATE POLICY "Users can insert their own loan application"
ON public.loan_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own loan application" ON public.loan_applications;
CREATE POLICY "Users can update their own loan application"
ON public.loan_applications FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own loan application" ON public.loan_applications;
CREATE POLICY "Users can delete their own loan application"
ON public.loan_applications FOR DELETE
TO authenticated
USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.set_loan_application_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_loan_application_updated_at ON public.loan_applications;
CREATE TRIGGER set_loan_application_updated_at
BEFORE UPDATE ON public.loan_applications
FOR EACH ROW EXECUTE FUNCTION public.set_loan_application_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user_loan_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.loan_applications (id, email_address, first_name, last_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_loan_application ON auth.users;
CREATE TRIGGER on_auth_user_created_loan_application
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_loan_application();