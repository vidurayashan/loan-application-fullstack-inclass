/**
 * DecisionPage - Page 4 of the loan application
 * 
 * Displays the loan decision result (approved or declined)
 * Demonstrates: Router State (reading data passed via navigate)
 * Uses useLocation() to access the state passed from SummarySubmitPage
 */

import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FormSection } from '../../FormSection';
import { IconButton } from '../../icon-button';
import type { DecisionResult } from '../types';

interface DecisionPageProps {
  onStartNew: () => void;
}

export function DecisionPage({ onStartNew }: DecisionPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const decision = location.state && typeof location.state === 'object'
    && typeof (location.state as DecisionResult).approved === 'boolean'
    ? location.state as DecisionResult
    : null;

  /**
   * Handle starting a new application
   */
  const handleStartNew = () => {
    onStartNew();
    navigate('/apply');
  };

  // Prevent direct navigation to this page without a decision result.
  if (!decision) {
    return <Navigate to="/" replace />;
  }

  // SVG icons for different states
  const approvedIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-green-600">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  const declinedIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-red-600">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  // Refresh icon for FormSection
  const refreshIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );

  // Check icon for IconButton
  const checkIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Decision</h1>
        <p className="text-gray-600">Your loan application has been processed</p>
      </div>

      {/* Decision Result */}
      <FormSection
        title={decision.approved ? "Congratulations!" : "We're Sorry"}
        subtitle={decision.approved 
          ? "Your loan application has been approved" 
          : "Your loan application has been declined"}
        icon={refreshIcon}
        blueIntensity={decision.approved ? 10 : 5}
      >
        <div className="text-center py-6">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {decision.approved ? approvedIcon : declinedIcon}
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
            decision.approved 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {decision.approved ? '✓ Approved' : '✗ Declined'}
          </div>

          {/* Reason */}
          {decision.reason && (
            <div className={`rounded-lg p-4 mt-4 ${
              decision.approved ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <p className={`text-sm ${
                decision.approved ? 'text-green-700' : 'text-red-700'
              }`}>
                {decision.reason}
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {decision.approved && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">Next Steps</p>
                <p className="text-sm text-blue-700 mt-1">
                  A loan specialist will contact you within 2 business days to complete the documentation process.
                </p>
              </div>
            </div>
          </div>
        )}

        {!decision.approved && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <div className="flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-800">Tips for Future Applications</p>
                <ul className="text-sm text-gray-700 mt-1 list-disc list-inside">
                  <li>Consider a smaller loan amount</li>
                  <li>Choose a shorter repayment term</li>
                  <li>Use an educational email address if available</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </FormSection>

      {/* Start New Application Button */}
      <div className="flex justify-center mt-6">
        <IconButton
          icon={checkIcon}
          iconPosition="right"
          onClick={handleStartNew}
        >
          Start New Application
        </IconButton>
      </div>
    </div>
  );
}