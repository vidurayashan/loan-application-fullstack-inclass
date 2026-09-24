import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadSavedApplication, setAccessToken, signIn } from '../api';

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await signIn({ email, password });
      if (!response.access_token) throw new Error('Sign-in succeeded but no access token was returned.');
      setAccessToken(response.access_token);
      const savedApplication = await loadSavedApplication();
      localStorage.setItem('loanApplication', JSON.stringify(savedApplication));
      navigate('/apply');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Sign in</h1>
        <p className="mt-2 text-gray-600">Sign in to complete and save your loan application.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700">Email address
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-gray-700">Password
            <input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={isSubmitting} className="w-full rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">New to Pacific Bank? <Link className="font-semibold text-primary-600" to="/signup">Create an account</Link></p>
        <p className="mt-3 text-center text-sm"><Link className="text-gray-500 hover:text-primary-600" to="/">Back to home</Link></p>
      </section>
    </main>
  );
}