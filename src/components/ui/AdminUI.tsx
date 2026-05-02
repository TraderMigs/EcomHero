'use client'
import React from 'react'

// ── Color palette ─────────────────────────────────────────────────────────────
export const palette = {
  bg: '#0f0f11',
  surface: '#18181b',
  surfaceHover: '#1f1f23',
  border: '#2a2a30',
  borderLight: '#232328',
  text: '#f4f4f5',
  textMuted: '#71717a',
  textDim: '#52525b',
  accent: '#6366f1',
  accentHover: '#4f46e5',
  accentDim: '#6366f115',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  dangerDim: '#ef444415',
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
export function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col gap-6 pb-8">
      {children}
    </div>
  )
}

// ── Page header ───────────────────────────────────────────────────────────────
export function AdminPageHeader({
  title, subtitle, action
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 pb-2 border-b" style={{ borderColor: palette.border }}>
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: palette.text }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: palette.textMuted }}>{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function AdminCard({
  children, title, subtitle, className = '', padding = true
}: {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  padding?: boolean
}) {
  return (
    <div
      className={`rounded-xl border overflow-hidden ${className}`}
      style={{ background: palette.surface, borderColor: palette.border }}>
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b" style={{ borderColor: palette.borderLight }}>
          {title && <p className="text-sm font-semibold" style={{ color: palette.text }}>{title}</p>}
          {subtitle && <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>{subtitle}</p>}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>
        {children}
      </div>
    </div>
  )
}

// ── Field label ───────────────────────────────────────────────────────────────
export function AdminField({
  label, hint, children, required
}: {
  label: string
  hint?: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest flex items-center gap-1" style={{ color: palette.textMuted }}>
        {label}
        {required && <span style={{ color: palette.danger }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-xs" style={{ color: palette.textDim }}>{hint}</p>}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function AdminInput({
  value, onChange, placeholder, type = 'text', disabled, className = ''
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2.5 rounded-lg text-sm border transition-all outline-none ${className}`}
      style={{
        background: palette.bg,
        borderColor: palette.border,
        color: palette.text,
      }}
      onFocus={e => { e.target.style.borderColor = palette.accent }}
      onBlur={e => { e.target.style.borderColor = palette.border }}
    />
  )
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function AdminTextarea({
  value, onChange, placeholder, rows = 4
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 rounded-lg text-sm border transition-all outline-none resize-y"
      style={{
        background: palette.bg,
        borderColor: palette.border,
        color: palette.text,
      }}
      onFocus={e => { e.target.style.borderColor = palette.accent }}
      onBlur={e => { e.target.style.borderColor = palette.border }}
    />
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function AdminSelect({
  value, onChange, options, disabled
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none appearance-none"
      style={{
        background: palette.bg,
        borderColor: palette.border,
        color: palette.text,
      }}>
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: palette.surface }}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function AdminToggle({
  label, checked, onChange, description
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  description?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className="relative mt-0.5 w-9 h-5 rounded-full transition-all shrink-0 cursor-pointer"
        style={{ background: checked ? palette.accent : palette.border }}>
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
          style={{ left: checked ? '18px' : '2px' }} />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: palette.text }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>{description}</p>}
      </div>
    </label>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
export function AdminButton({
  children, onClick, variant = 'primary', size = 'md', disabled, loading, icon, type = 'button'
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  type?: 'button' | 'submit'
}) {
  const styles = {
    primary: { background: palette.accent, color: '#fff', border: 'none' },
    secondary: { background: 'transparent', color: palette.text, border: `1px solid ${palette.border}` },
    danger: { background: palette.dangerDim, color: palette.danger, border: `1px solid ${palette.danger}40` },
    ghost: { background: 'transparent', color: palette.textMuted, border: 'none' },
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-1.5 rounded-lg font-semibold transition-all disabled:opacity-40 ${sizes[size]}`}
      style={styles[variant]}>
      {loading ? (
        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function AdminBadge({
  children, variant = 'default'
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
}) {
  const styles = {
    default: { background: palette.border, color: palette.textMuted },
    success: { background: '#22c55e18', color: '#22c55e' },
    warning: { background: '#f59e0b18', color: '#f59e0b' },
    danger: { background: '#ef444418', color: '#ef4444' },
    info: { background: '#3b82f618', color: '#3b82f6' },
    purple: { background: '#8b5cf618', color: '#8b5cf6' },
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={styles[variant]}>
      {children}
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
export function AdminStat({
  label, value, icon, color = palette.accent
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: string
}) {
  return (
    <div className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ background: palette.surface, borderColor: palette.border }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: palette.textMuted }}>{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '20', color }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: palette.text }}>{value}</p>
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────
export function AdminTable({
  headers, children, empty
}: {
  headers: string[]
  children: React.ReactNode
  empty?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: palette.surface, borderColor: palette.border }}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: palette.borderLight }}>
            {headers.map(h => (
              <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.textMuted, background: palette.bg }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
      {empty}
    </div>
  )
}

export function AdminTableRow({
  children, onClick
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <tr
      onClick={onClick}
      className="border-b transition-colors"
      style={{
        borderColor: palette.borderLight,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLTableRowElement).style.background = palette.surfaceHover }}
      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}>
      {children}
    </tr>
  )
}

export function AdminTableCell({
  children, className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <td className={`px-5 py-3.5 ${className}`} style={{ color: palette.text }}>
      {children}
    </td>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function AdminEmpty({
  icon, title, subtitle, action
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: palette.border, color: palette.textMuted }}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm" style={{ color: palette.text }}>{title}</p>
        {subtitle && <p className="text-xs mt-1" style={{ color: palette.textMuted }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Section divider ───────────────────────────────────────────────────────────
export function AdminDivider() {
  return <div className="h-px" style={{ background: palette.border }} />
}

// ── Color picker ──────────────────────────────────────────────────────────────
export function AdminColorPicker({
  value, onChange, label
}: {
  value: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border cursor-pointer opacity-0 absolute inset-0"
          style={{ borderColor: palette.border }} />
        <div className="w-10 h-10 rounded-lg border-2 pointer-events-none"
          style={{ background: value, borderColor: palette.border }} />
      </div>
      <div>
        <p className="text-xs" style={{ color: palette.textMuted }}>{label}</p>
        <p className="text-sm font-mono font-semibold" style={{ color: palette.text }}>{value}</p>
      </div>
    </div>
  )
}

// ── Page back link ────────────────────────────────────────────────────────────
export function AdminBackLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="flex items-center gap-1.5 text-xs font-medium transition-colors w-fit"
      style={{ color: palette.textMuted }}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = palette.text }}
      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = palette.textMuted }}>
      ← {label}
    </a>
  )
}
