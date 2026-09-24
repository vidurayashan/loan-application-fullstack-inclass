/**
 * PersonalInfoPage - Page 1 of the loan application
 * 
 * Collects personal information: first name, last name, email, phone
 * Uses controlled inputs with validation on blur (touched pattern)
 * Demonstrates: Props Down (initialData), Callbacks Up (onComplete)
 */

import { useState, useCallback } from 'react';
import { FormSection } from '../../FormSection';
import { IconButton } from '../../icon-button';
import type { PersonalInfo, PersonalInfoErrors, TouchedState } from '../types';

interface PersonalInfoPageProps {
  initialData: PersonalInfo;
  onComplete: (data: PersonalInfo) => void | Promise<void>;
}

export function PersonalInfoPage({ initialData, onComplete }: PersonalInfoPageProps) {
  // Local form state - initialized from props (Props Down)
  const [formData, setFormData] = useState<PersonalInfo>(initialData);
  
  // Touched state - tracks which fields user has interacted with
  const [touched, setTouched] = useState<TouchedState<PersonalInfo>>({});
  
  // Validation errors - only shown when field is touched
  const [errors, setErrors] = useState<PersonalInfoErrors>({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Validate a single field
   * Returns error message if invalid, undefined if valid
   */
  const validateField = useCallback((name: keyof PersonalInfo, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        return undefined;
      
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        return undefined;
      
      case 'email': {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return undefined;
      }
      
      case 'phone': {
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[-\d\s+()]{10,}$/;
        if (!phoneRegex.test(value)) return 'Please enter a valid phone number';
        return undefined;
      }
      
      default:
        return undefined;
    }
  }, []);

  /**
   * Validate all fields - used to check if form is valid
   */
  const validateAll = useCallback((): PersonalInfoErrors => {
    const newErrors: PersonalInfoErrors = {};
    (Object.keys(formData) as Array<keyof PersonalInfo>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  }, [formData, validateField]);

  /**
   * Handle input change - update form data and clear error
   */
  const handleChange = useCallback((name: keyof PersonalInfo, value: string) => {
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
  const handleBlur = useCallback((name: keyof PersonalInfo) => {
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
    const allTouched: TouchedState<PersonalInfo> = {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
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
  const userIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );

  // Arrow icon for IconButton
  const arrowIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Application</h1>
        <p className="text-gray-600">Step 1 of 3: Personal Information</p>
      </div>

      {/* Personal Information Form Section */}
      <FormSection
        title="Personal Information"
        subtitle="Please provide your contact details"
        icon={userIcon}
        blueIntensity={20}
      >
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
              touched.firstName && errors.firstName
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="Enter your first name"
          />
          {touched.firstName && errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
              touched.lastName && errors.lastName
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="Enter your last name"
          />
          {touched.lastName && errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
              touched.email && errors.email
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="you@example.com"
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
              touched.phone && errors.phone
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="(123) 456-7890"
          />
          {touched.phone && errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
      </FormSection>

      {/* Navigation - Next Button using IconButton */}
      <div className="flex justify-end mt-6">
        <IconButton
          icon={arrowIcon}
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