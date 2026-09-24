import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  blueIntensity?: number; // 0-100, controls bluish tint intensity (default: 30)
  showDivider?: boolean;
  className?: string;
}

export function FormSection({ 
  title, 
  subtitle, 
  icon, 
  children, 
  blueIntensity = 30,
  showDivider = false,
  className = '' 
}: FormSectionProps) {
  // Generate unique ID for accessibility
  const titleId = `section-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Clamp blue intensity between 0 and 100
  const intensity = Math.max(0, Math.min(100, blueIntensity));
  
  return (
    <section
      role="region"
      aria-labelledby={titleId}
      className={`
        relative overflow-hidden
        bg-white rounded-xl 
        border border-gray-200 border-l-4 border-l-primary-500
        shadow-sm hover:shadow-md
        transition-shadow duration-300
        p-4 md:p-6 lg:p-8
        mb-6
        ${className}
      `.trim()}
    >
      {/* Bluish tint overlay */}
      <div 
        className="absolute inset-0 bg-blue-50 pointer-events-none -z-10"
        style={{ opacity: intensity / 100 }}
        aria-hidden="true"
      />
      
      {/* Header section with icon, title, and subtitle */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          {/* Optional icon */}
          {icon && (
            <span 
              className="flex-shrink-0 w-6 h-6 text-primary-600 mt-0.5" 
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          
          {/* Title and subtitle container */}
          <div className="flex-1 min-w-0">
            <h2 
              id={titleId}
              className="text-2xl font-bold text-gray-900 leading-tight"
            >
              {title}
            </h2>
            
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
      {showDivider && (
        <hr className="border-gray-200 mb-6" aria-hidden="true" />
      )}
      
      {/* Content section */}
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}
