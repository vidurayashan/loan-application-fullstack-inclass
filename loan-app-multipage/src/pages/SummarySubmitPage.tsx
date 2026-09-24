/**
 * SummarySubmitPage - Page 3 of the loan application
 * 
 * Displays a read-only summary of all collected data
 * Uses ThreeDButton for the final Submit Application button
 * Demonstrates: Props Down (personalInfo, loanDetails), Callbacks Up (onSubmit)
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormSection } from '../../FormSection';
import { IconButton } from '../../icon-button';
import { ThreeDButton } from '../../ThreeDButton';
import type { PersonalInfo, LoanDetails } from '../types';

interface SummarySubmitPageProps {
  personalInfo: PersonalInfo;
  loanDetails: LoanDetails;
  onSubmit: () => void | Promise<void>;
  submissionError?: string;
}

export function SummarySubmitPage({ personalInfo, loanDetails, onSubmit, submissionError }: SummarySubmitPageProps) {
  const navigate = useNavigate();

  /**
   * Handle back navigation to loan details page
   */
  const handleBack = useCallback(() => {
    navigate('/loan-details');
  }, [navigate]);

  /**
   * Format currency for display
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  /**
   * Get purpose label from value
   */
  const getPurposeLabel = (purpose: string): string => {
    const purposes: Record<string, string> = {
      home: 'Home Improvement',
      car: 'Vehicle Purchase',
      education: 'Education',
      medical: 'Medical Expenses',
      debt: 'Debt Consolidation',
      business: 'Business',
      other: 'Other',
    };
    return purposes[purpose] || purpose;
  };

  // SVG icons for FormSections
  const userIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );

  const banknotesIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
  );

  // Arrow icon for IconButton
  const arrowLeftIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Application</h1>
        <p className="text-gray-600">Step 3 of 3: Review & Submit</p>
      </div>

      {/* Personal Information Summary */}
      <FormSection
        title="Personal Information"
        subtitle="Your contact details"
        icon={userIcon}
        blueIntensity={15}
        showDivider
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium text-gray-900">{personalInfo.firstName} {personalInfo.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{personalInfo.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium text-gray-900">{personalInfo.phone}</p>
          </div>
        </div>
      </FormSection>

      {/* Loan Details Summary */}
      <FormSection
        title="Loan Details"
        subtitle="Your loan request"
        icon={banknotesIcon}
        blueIntensity={15}
      >
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-medium text-gray-900">{formatCurrency(loanDetails.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Term</p>
            <p className="font-medium text-gray-900">{loanDetails.term} months</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Purpose</p>
            <p className="font-medium text-gray-900">{getPurposeLabel(loanDetails.purpose)}</p>
          </div>
        </div>
      </FormSection>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">Please review your information</p>
            <p className="text-sm text-amber-700 mt-1">
              By clicking "Submit Application", you confirm that all information provided is accurate and complete.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation - Back and Submit Buttons */}
      <div className="flex justify-between mt-6">
        <IconButton
          icon={arrowLeftIcon}
          iconPosition="left"
          onClick={handleBack}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Back
        </IconButton>
        
        {/* ThreeDButton used ONLY for the final Submit button */}
        <ThreeDButton
          label="Submit Application"
          onClick={onSubmit}
          variant="primary"
        />
      </div>
        {submissionError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{submissionError}</p>}
    </div>
  );
}