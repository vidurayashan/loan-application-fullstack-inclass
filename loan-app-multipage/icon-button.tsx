import * as React from 'react'

export interface IconButtonProps {
  icon?: React.ReactNode | React.ComponentType<{ 'aria-hidden'?: boolean }>
  iconPosition?: 'left' | 'right'
  animate?: boolean
  children?: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, iconPosition = 'right', animate = true, children, className, onClick, disabled }, ref) => {
    const animation = animate ? (iconPosition === 'right' ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1') : ''

    const renderIcon = () => {
      if (!icon) return null
      if (typeof icon === 'function') {
        const Icon = icon as React.ComponentType<{ 'aria-hidden'?: boolean }>
        return <Icon aria-hidden />
      }
      return icon
    }

    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={cn('inline-flex items-center gap-2 px-4 py-2 rounded bg-primary-600 text-white disabled:opacity-60', 'group', className)}
        aria-disabled={disabled}
      >
        {iconPosition === 'left' && <span className={cn('inline-flex', animation)}>{renderIcon()}</span>}
        {children}
        {iconPosition === 'right' && <span className={cn('inline-flex', animation)}>{renderIcon()}</span>}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

export { IconButton }
