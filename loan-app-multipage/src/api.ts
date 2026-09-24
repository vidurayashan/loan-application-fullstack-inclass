import type { LoanApplication, LoanDetails, PersonalInfo } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
const ACCESS_TOKEN_KEY = 'loanAppAccessToken';

export interface AuthResponse {
  access_token?: string;
  user?: { id: string; email?: string };
}

interface StoredLoanApplication {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  loan_amount: number;
  loan_term: number;
  loan_purpose: string;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}, authenticated = false): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (authenticated) {
    const token = getAccessToken();
    if (!token) throw new Error('Please sign in before continuing.');
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail ?? 'The request could not be completed.');
  return body as T;
}

export function signUp(data: { email: string; password: string; first_name: string; last_name: string }): Promise<AuthResponse> {
  return request('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
}

export function signIn(data: { email: string; password: string }): Promise<AuthResponse> {
  return request('/auth/signin', { method: 'POST', body: JSON.stringify(data) });
}

export function saveLoanApplication(application: LoanApplication): Promise<{ message: string; id: string }> {
  return request('/loan-applications/me', {
    method: 'PUT',
    body: JSON.stringify({
      first_name: application.personalInfo.firstName,
      last_name: application.personalInfo.lastName,
      email_address: application.personalInfo.email,
      phone_number: application.personalInfo.phone,
      loan_amount: Number(application.loanDetails.amount),
      loan_term: Number(application.loanDetails.term),
      loan_purpose: application.loanDetails.purpose,
    }),
  }, true);
}

export function savePersonalInfoDraft(personalInfo: PersonalInfo): Promise<{ message: string; id: string }> {
  return request('/loan-applications/me', { method: 'PATCH', body: JSON.stringify({
    first_name: personalInfo.firstName, last_name: personalInfo.lastName,
    email_address: personalInfo.email, phone_number: personalInfo.phone,
  }) }, true);
}

export function saveLoanDetailsDraft(loanDetails: LoanDetails): Promise<{ message: string; id: string }> {
  return request('/loan-applications/me', { method: 'PATCH', body: JSON.stringify({
    loan_amount: Number(loanDetails.amount), loan_term: Number(loanDetails.term), loan_purpose: loanDetails.purpose,
  }) }, true);
}

export async function loadSavedApplication(): Promise<LoanApplication> {
  const stored = await request<StoredLoanApplication>('/loan-applications/me', {}, true);
  return {
    personalInfo: { firstName: stored.first_name || '', lastName: stored.last_name || '', email: stored.email_address || '', phone: stored.phone_number || '' },
    loanDetails: { amount: Number(stored.loan_amount) || 0, term: Number(stored.loan_term) || 0, purpose: stored.loan_purpose || '' },
  };
}