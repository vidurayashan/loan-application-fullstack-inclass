/**
 * App.tsx - Central state management and routing
 * 
 * ============================================
 * HOW DATA FLOWS IN THIS APPLICATION
 * ============================================
 * 
 * 1. PROPS DOWN (App → Pages):
 *    - App stores all form data in state
 *    - App passes saved data to each page via props
 *    - Pages receive data and use it to initialize their local form state
 * 
 * 2. CALLBACKS UP (Pages → App):
 *    - Each page has an `onComplete` callback prop
 *    - When user clicks "Next", page validates and calls onComplete(data)
 *    - App receives the data and updates its central state
 * 
 * 3. ROUTER STATE (Summary → Decision):
 *    - On submit, App navigates to /decision with state object
 *    - DecisionPage reads the decision result from useLocation().state
 *    - This demonstrates one-time data transfer via router
 * 
 * ============================================
 * DUMMY DECISION LOGIC
 * ============================================
 * 
 * The loan is APPROVED if:
 *   - Amount <= 5000 AND term <= 24 months
 *   - OR email ends with ".edu"
 * 
 * Otherwise, the loan is REJECTED.
 */

import { BrowserRouter, Navigate, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { PersonalInfo, LoanDetails, LoanApplication, DecisionResult } from './types';
import { LandingPage } from './pages/LandingPage';
import { PersonalInfoPage } from './pages/PersonalInfoPage';
import { LoanDetailsPage } from './pages/LoanDetailsPage';
import { SummarySubmitPage } from './pages/SummarySubmitPage';
import { DecisionPage } from './pages/DecisionPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { getAccessToken, saveLoanApplication, saveLoanDetailsDraft, savePersonalInfoDraft } from './api';

// Default empty state for a new application
const defaultApplication: LoanApplication = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  loanDetails: {
    amount: 0,
    term: 0,
    purpose: '',
  },
};

function ProtectedRoute({ children }: { children: ReactNode }) {
  return getAccessToken() ? <>{children}</> : <Navigate to="/signin" replace />;
}

/**
 * LoanApp component - contains all the routing logic
 * We need this as a separate component so we can use useNavigate
 */
function LoanApp() {
  // ============================================
  // CENTRAL STATE - All form data stored here
  // ============================================
  const [application, setApplication] = useState<LoanApplication>(() => {
    // Try to load from localStorage on initial mount
    const saved = localStorage.getItem('loanApplication');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only restore if it has the expected structure
        if (parsed.personalInfo && parsed.loanDetails) {
          return parsed;
        }
      } catch {
        // If parsing fails, use default
      }
    }
    return defaultApplication;
  });

  const navigate = useNavigate();
  const [submissionError, setSubmissionError] = useState('');

  const requireAuthentication = useCallback((): boolean => {
    if (getAccessToken()) return true;
    navigate('/signin');
    return false;
  }, [navigate]);

  // ============================================
  // CALLBACK FUNCTIONS - Pages call these to update App state
  // ============================================

  /**
   * Called by PersonalInfoPage when user clicks "Next"
   * Updates personalInfo in central state and navigates to next page
   */
  const handlePersonalInfoComplete = useCallback(async (data: PersonalInfo) => {
    if (!requireAuthentication()) return;
    await savePersonalInfoDraft(data);
    const updatedApplication = {
      ...application,
      personalInfo: data,
    };
    setApplication(updatedApplication);
    localStorage.setItem('loanApplication', JSON.stringify(updatedApplication));
    navigate('/loan-details');
  }, [application, navigate, requireAuthentication]);

  /**
   * Called by LoanDetailsPage when user clicks "Next"
   * Updates loanDetails in central state and navigates to summary
   */
  const handleLoanDetailsComplete = useCallback(async (data: LoanDetails) => {
    if (!requireAuthentication()) return;
    await saveLoanDetailsDraft(data);
    const updatedApplication = {
      ...application,
      loanDetails: data,
    };
    setApplication(updatedApplication);
    localStorage.setItem('loanApplication', JSON.stringify(updatedApplication));
    navigate('/summary');
  }, [application, navigate, requireAuthentication]);

  /**
   * Called by SummarySubmitPage when user clicks "Submit Application"
   * Implements the dummy decision logic and navigates to decision page
   */
  const handleSubmitApplication = useCallback(async () => {
    if (!requireAuthentication()) return;
    setSubmissionError('');
    const { personalInfo, loanDetails } = application;

    try {
      await saveLoanApplication(application);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'Unable to save your application.');
      return;
    }

    // ============================================
    // LOAN DECISION LOGIC
    // ============================================
    let approved = false;
    let reason: string | undefined;

    // Rule 1: Maximum cap - amounts above $20,000 always require manual review
    if (loanDetails.amount > 20000) {
      approved = false;
      reason = 'Loan amounts above $20,000 require manual review regardless of eligibility.';
    }
    // Rule 2: Small loans (≤ $5,000) with reasonable term
    else if (loanDetails.amount <= 5000 && loanDetails.term <= 24) {
      approved = true;
      reason = 'Approved: Loan amount and term within acceptable limits';
    }
    // Rule 3: Medium loans ($5,001-$20,000) require stronger signals
    else if (loanDetails.amount <= 20000 && personalInfo.email.endsWith('.edu')) {
      approved = true;
      reason = 'Approved: Educational email address detected';
    }
    // Otherwise reject
    else {
      approved = false;
      reason = 'Declined: Loan amount or term exceeds our current limits';
    }

    const decision: DecisionResult = { approved, reason };

    // Save complete application with decision to localStorage
    localStorage.setItem('loanApplication', JSON.stringify({
      ...application,
      decision,
      submittedAt: new Date().toISOString(),
    }));

    // Navigate to decision page with router state
    navigate('/decision', { state: decision });
  }, [application, navigate, requireAuthentication]);

  /**
   * Called to reset the application and start fresh
   */
  const handleStartNew = useCallback(() => {
    setApplication(defaultApplication);
    localStorage.removeItem('loanApplication');
    navigate('/apply');
  }, [navigate]);

  // ============================================
  // ROUTING - Each route renders a page with props
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />

        {/* Page 1: Personal Information */}
        <Route
          path="/apply"
          element={
            <ProtectedRoute><PersonalInfoPage initialData={application.personalInfo} onComplete={handlePersonalInfoComplete} /></ProtectedRoute>
          }
        />

        {/* Page 2: Loan Details */}
        <Route
          path="/loan-details"
          element={
            <ProtectedRoute><LoanDetailsPage initialData={application.loanDetails} onComplete={handleLoanDetailsComplete} /></ProtectedRoute>
          }
        />

        {/* Page 3: Summary & Submit */}
        <Route
          path="/summary"
          element={
            <ProtectedRoute><SummarySubmitPage
              personalInfo={application.personalInfo}
              loanDetails={application.loanDetails}
              onSubmit={handleSubmitApplication}
              submissionError={submissionError}
            /></ProtectedRoute>
          }
        />

        {/* Page 4: Decision Result */}
        <Route
          path="/decision"
          element={<ProtectedRoute><DecisionPage onStartNew={handleStartNew} /></ProtectedRoute>}
        />
      </Routes>
    </div>
  );
}

/**
 * App component - wraps everything in BrowserRouter
 */
export default function App() {
  return (
    <BrowserRouter>
      <LoanApp />
    </BrowserRouter>
  );
}