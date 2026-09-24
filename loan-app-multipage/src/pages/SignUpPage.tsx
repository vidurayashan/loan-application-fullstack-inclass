import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setAccessToken, signUp } from '../api';

export function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await signUp({ email: form.email, password: form.password, first_name: form.firstName, last_name: form.lastName });
      if (response.access_token) {
        setAccessToken(response.access_token);
        navigate('/apply');
      } else {
        setMessage('Account created. Check your email to confirm your account, then sign in.');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
        <p className="mt-2 text-gray-600">Create an account before starting your application.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium text-gray-700">First name<input required value={form.firstName} onChange={(event) => update('firstName', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label><label className="text-sm font-medium text-gray-700">Last name<input required value={form.lastName} onChange={(event) => update('lastName', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label></div>
          <label className="block text-sm font-medium text-gray-700">Email address<input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
          <label className="block text-sm font-medium text-gray-700">Password<input required type="password" minLength={6} value={form.password} onChange={(event) => update('password', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
          <label className="block text-sm font-medium text-gray-700">Confirm password<input required type="password" minLength={6} value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
          <button disabled={isSubmitting} className="w-full rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{isSubmitting ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">Already have an account? <Link className="font-semibold text-primary-600" to="/signin">Sign in</Link></p>
      </section>
    </main>
  );
}