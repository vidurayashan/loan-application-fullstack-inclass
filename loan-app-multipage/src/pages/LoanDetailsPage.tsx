/**
 * LoanDetailsPage - Page 2 of the loan application
 * 
 * Collects loan details: amount, term, purpose
 * Uses controlled inputs with validation on blur (touched pattern)
 * Demonstrates: Props Down (initialData), Callbacks Up (onComplete)
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormSection } from '../../FormSection';
import { IconButton } from '../../icon-button';
import type { LoanDetails, LoanDetailsErrors, TouchedState } from '../types';

interface LoanDetailsPageProps {
  initialData: LoanDetails;
  onComplete: (data: LoanDetails) => void | Promise<void>;
}

export function LoanDetailsPage({ initialData, onComplete }: LoanDetailsPageProps) {
  const navigate = useNavigate();
  // Local form state - initialized from props (Props Down)
  const [formData, setFormData] = useState<LoanDetails>(initialData);
  
  // Touched state - tracks which fields user has interacted with
  const [touched, setTouched] = useState<TouchedState<LoanDetails>>({});
  
  // Validation errors - only shown when field is touched
  const [errors, setErrors] = useState<LoanDetailsErrors>({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Validate a single field
   * Returns error message if invalid, undefined if valid
   */
  const validateField = useCallback((name: keyof LoanDetails, value: string | number): string | undefined => {
    switch (name) {
      case 'amount': {
        const numAmount = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numAmount) || numAmount <= 0) return 'Please enter a valid loan amount greater than 0';
        if (numAmount > 100000) return 'Loan amount cannot exceed $100,000';
        return undefined;
      }
      
      case 'term': {
        const numTerm = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(numTerm) || numTerm <= 0) return 'Please enter a valid term in months';
        if (numTerm > 360) return 'Loan term cannot exceed 360 months';
        return undefined;
      }
      
      case 'purpose':
        if (!value || (typeof value === 'string' && !value.trim())) return 'Please select a loan purpose';
        return undefined;
      
      default:
        return undefined;
    }
  }, []);

  /**
   * Validate all fields - used to check if form is valid
   */
  const validateAll = useCallback((): LoanDetailsErrors => {
    const newErrors: LoanDetailsErrors = {};
    (Object.keys(formData) as Array<keyof LoanDetails>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  }, [formData, validateField]);

  /**
   * Handle input change - update form data and clear error
   */
  const handleChange = useCallback((name: keyof LoanDetails, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing (if field was touched)
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  }, [touched, validateField]);

  /**
   * Handle blur - mark field as touched and validate
   * This is the "validate on blur" pattern
   */
  const handleBlur = useCallback((name: keyof LoanDetails) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name]) }));
  }, [formData, validateField]);

  /**
   * Handle form submission (Next button)
   * Validates all fields and calls onComplete if valid
   */
  const handleNext = useCallback(async () => {
    setSaveError('');
    // Mark all fields as touched
    const allTouched: TouchedState<LoanDetails> = {
      amount: true,
      term: true,
      purpose: true,
    };
    setTouched(allTouched);

    // Validate all fields
    const newErrors = validateAll();
    setErrors(newErrors);

    // If no errors, call onComplete (Callbacks Up)
    if (Object.keys(newErrors).length === 0) {
      setIsSaving(true);
      try {
        await onComplete(formData);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Unable to save your application draft.');
      } finally {
        setIsSaving(false);
      }
    }
  }, [formData, validateAll, onComplete]);

  // Check if form is valid (for disabling Next button)
  const allErrors = validateAll();
  const isFormValid = Object.keys(allErrors).length === 0;

  // SVG icons for FormSection
  const banknotesIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
  );

  // Arrow icons for IconButton
  const arrowRightIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );

  const arrowLeftIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );

  // Loan purpose options
  const purposeOptions = [
    { value: '', label: 'Select a purpose...' },
    { value: 'home', label: 'Home Improvement' },
    { value: 'car', label: 'Vehicle Purchase' },
    { value: 'education', label: 'Education' },
    { value: 'medical', label: 'Medical Expenses' },
    { value: 'debt', label: 'Debt Consolidation' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Application</h1>
        <p className="text-gray-600">Step 2 of 3: Loan Details</p>
      </div>

      {/* Loan Details Form Section */}
      <FormSection
        title="Loan Details"
        subtitle="Tell us about the loan you need"
        icon={banknotesIcon}
        blueIntensity={20}
      >
        {/* Loan Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Loan Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount || ''}
            onChange={(e) => handleChange('amount', e.target.value)}
            onBlur={() => handleBlur('amount')}
            min="1"
            max="100000"
            step="100"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
              touched.amount && errors.amount
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="Enter loan amount"
          />
          {touched.amount && errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Loan Term */}
        <div>
          <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">
            Loan Term (months)
          </label>
          <input
            type="number"
            id="term"
            value={formData.term || ''}
            onChange={(e) => handleChange('term', e.target.value)}
            onBlur={() => handleBlur('term')}
            min="1"
            max="360"
            step="1"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
              touched.term && errors.term
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="Enter term in months"
          />
          {touched.term && errors.term && (
            <p className="mt-1 text-sm text-red-600">{errors.term}</p>
          )}
        </div>

        {/* Loan Purpose */}
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
            Loan Purpose
          </label>
          <select
            id="purpose"
            value={formData.purpose}
            onChange={(e) => handleChange('purpose', e.target.value)}
            onBlur={() => handleBlur('purpose')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
              touched.purpose && errors.purpose
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
          >
            {purposeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {touched.purpose && errors.purpose && (
            <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
          )}
        </div>
      </FormSection>

      {/* Navigation - Back and Next Buttons */}
      <div className="flex justify-between mt-6">
        <IconButton
          icon={arrowLeftIcon}
          iconPosition="left"
          onClick={() => navigate('/apply')}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Back
        </IconButton>
        <IconButton
          icon={arrowRightIcon}
          iconPosition="right"
          onClick={handleNext}
          disabled={!isFormValid || isSaving}
        >
          {isSaving ? 'Saving...' : 'Continue'}
        </IconButton>
      </div>
      {saveError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{saveError}</p>}
    </div>
  );
}