'use client'

import React from 'react'
import '../styles/neon.css'

type ButtonVariant = 'cyan' | 'magenta' | 'green'

interface NeonButtonProps {
  variant?: ButtonVariant
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
  title?: string
}

/**
 * NeonButton Component - Futuristic neon-styled action button
 *
 * Features:
 * - Three color variants: cyan, magenta, green
 * - Glowing effects with hover scale transformation
 * - Disabled state with reduced opacity
 * - Smooth transitions with cubic-bezier easing
 *
 * Variants:
 * - cyan: Electric blue glow, primary actions
 * - magenta: Pink/magenta glow, secondary actions
 * - green: Bright green glow, success/confirm actions
 *
 * @param variant - Button color variant (default: 'cyan')
 * @param onClick - Callback when button is clicked
 * @param disabled - If true, button is disabled
 * @param children - Button content
 * @param className - Additional CSS classes to apply
 * @param type - HTML button type
 * @param ariaLabel - Accessibility label
 * @param title - Tooltip title
 */
export const NeonButton: React.FC<NeonButtonProps> = ({
  variant = 'cyan',
  onClick,
  disabled = false,
  children,
  className = '',
  type = 'button',
  ariaLabel,
  title,
}) => {
  const buttonClass = `btn-neon btn-neon-${variant}`

  return (
    <button
      type={type}
      className={`${buttonClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  )
}

/**
 * Preset button variants for common use cases
 */

export const PrimaryButton: React.FC<Omit<NeonButtonProps, 'variant'>> = (props) => (
  <NeonButton variant="cyan" {...props} />
)

export const SecondaryButton: React.FC<Omit<NeonButtonProps, 'variant'>> = (props) => (
  <NeonButton variant="magenta" {...props} />
)

export const SuccessButton: React.FC<Omit<NeonButtonProps, 'variant'>> = (props) => (
  <NeonButton variant="green" {...props} />
)

export default NeonButton
