import React from 'react';

interface ThreeDButtonProps {
  /** The text label displayed on the button */
  label: string;
  /** Click handler function */
  onClick?: () => void;
  /** Visual style variant - primary (purple) or secondary (gray) */
  variant?: 'primary' | 'secondary';
  /** Disabled state - prevents interaction */
  disabled?: boolean;
  /** Loading state - shows spinner and prevents interaction */
  loading?: boolean;
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Additional Tailwind classes for customization */
  className?: string;
}

/**
 * ThreeDButton - A modern, tactile 3D button component
 * 
 * Features:
 * - Raised 3D appearance with shadows and gradients
 * - Press-in animation on click
 * - Primary and secondary variants
 * - Disabled and loading states
 * - Keyboard accessible
 * - Fully styled with Tailwind CSS
 * 
 * @example
 * <ThreeDButton 
 *   label="Submit" 
 *   variant="primary" 
 *   onClick={handleSubmit}
 * />
 */
export const ThreeDButton: React.FC<ThreeDButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
}) => {
  const isDisabled = disabled || loading;

  // Base styles - common to all buttons
  const baseStyles = `
    relative
    px-8 py-3
    font-semibold text-lg
    rounded-xl
    transition-all duration-150 ease-in-out
    focus:outline-none focus:ring-4 focus:ring-offset-2
    transform
    select-none
  `;

  // Variant-specific styles
  const variantStyles = {
    primary: `
      bg-gradient-to-b from-primary-500 to-primary-600
      text-white
      shadow-[0_6px_0_0_rgb(126,34,206),0_8px_12px_rgba(168,85,247,0.4)]
      hover:shadow-[0_4px_0_0_rgb(126,34,206),0_6px_10px_rgba(168,85,247,0.5)]
      active:shadow-[0_2px_0_0_rgb(126,34,206),0_3px_6px_rgba(168,85,247,0.3)]
      hover:translate-y-[2px]
      active:translate-y-[4px]
      focus:ring-primary-400
    `,
    secondary: `
      bg-gradient-to-b from-gray-200 to-gray-300
      text-gray-800
      shadow-[0_6px_0_0_rgb(107,114,128),0_8px_12px_rgba(156,163,175,0.4)]
      hover:shadow-[0_4px_0_0_rgb(107,114,128),0_6px_10px_rgba(156,163,175,0.5)]
      active:shadow-[0_2px_0_0_rgb(107,114,128),0_3px_6px_rgba(156,163,175,0.3)]
      hover:translate-y-[2px]
      active:translate-y-[4px]
      focus:ring-gray-400
    `,
  };

  // Disabled state styles
  const disabledStyles = `
    opacity-60
    cursor-not-allowed
    shadow-[0_4px_0_0_rgba(107,114,128,0.3),0_4px_8px_rgba(0,0,0,0.1)]
    hover:translate-y-0
    active:translate-y-0
    hover:shadow-[0_4px_0_0_rgba(107,114,128,0.3),0_4px_8px_rgba(0,0,0,0.1)]
    active:shadow-[0_4px_0_0_rgba(107,114,128,0.3),0_4px_8px_rgba(0,0,0,0.1)]
  `;

  // Combine all styles
  const buttonStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${isDisabled ? disabledStyles : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Ensure keyboard accessibility (Enter and Space)
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      onClick?.();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={buttonStyles}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-3">
          {/* Loading Spinner */}
          <svg
            className="animate-spin h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        label
      )}
    </button>
  );
};
