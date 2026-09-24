/**
 * Shared types for the Loan Application
 * 
 * These types define the shape of data flowing through the application:
 * - PersonalInfo: User's personal details
 * - LoanDetails: Loan request information
 * - LoanApplication: Complete application combining both
 * - ValidationErrors: Form validation error messages
 * - DecisionResult: Outcome from the decision logic
 */

// Personal information collected on page 1
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// Loan details collected on page 2
export interface LoanDetails {
  amount: number;
  term: number;
  purpose: string;
}

// Complete loan application combining all data
export interface LoanApplication {
  personalInfo: PersonalInfo;
  loanDetails: LoanDetails;
}

// Validation errors - keys match field names, values are error messages
export type PersonalInfoErrors = {
  [K in keyof PersonalInfo]?: string;
};

export type LoanDetailsErrors = {
  [K in keyof LoanDetails]?: string;
};

// Decision result passed via router state from Summary to Decision page
export interface DecisionResult {
  approved: boolean;
  reason?: string;
}

// Touched state for each field (used for validation display)
export type TouchedState<T> = {
  [K in keyof T]?: boolean;
};