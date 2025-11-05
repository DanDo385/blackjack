'use client'

import React from 'react'
import '../styles/neon.css'

interface NeonContainerProps {
  title?: string
  variant?: 'cyan' | 'purple' | 'dark'
  children: React.ReactNode
  className?: string
  glassEffect?: boolean
}

/**
 * NeonContainer Component - Futuristic container with neon border and glass effect
 *
 * Features:
 * - Glowing neon border (cyan by default)
 * - Scanning line animation for cyberpunk aesthetic
 * - Optional glass morphism backdrop blur
 * - Multiple color variants
 * - Inset glow effects
 *
 * Variants:
 * - cyan: Electric cyan border and glow (default)
 * - purple: Deep purple border and glow (alternative)
 * - dark: Dark variant with subtle effects
 *
 * @param title - Optional container title
 * @param variant - Color variant (default: 'cyan')
 * @param children - Container content
 * @param className - Additional CSS classes to apply
 * @param glassEffect - If true, applies glass morphism backdrop blur
 */
export const NeonContainer: React.FC<NeonContainerProps> = ({
  title,
  variant = 'cyan',
  children,
  className = '',
  glassEffect = true,
}) => {
  const containerClass = `container-neon ${glassEffect ? 'glass' : ''} ${className}`

  return (
    <div className={containerClass}>
      {title && <h2 className="title-neon">{title}</h2>}
      {children}
    </div>
  )
}

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  isDark?: boolean
}

/**
 * GlassCard Component - Individual glass morphism card
 *
 * Features:
 * - Semi-transparent background with blur effect
 * - Subtle cyan border
 * - Smooth hover transitions
 *
 * @param children - Card content
 * @param className - Additional CSS classes to apply
 * @param isDark - If true, uses dark glass variant
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  isDark = false,
}) => {
  const glassClass = isDark ? 'glass-dark' : 'glass'
  return <div className={`${glassClass} ${className}`}>{children}</div>
}

export default NeonContainer
