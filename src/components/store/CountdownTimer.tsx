'use client'
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface Props {
  endsAt: string // ISO date string
  label?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function calcTimeLeft(endsAt: string): TimeLeft {
  const diff = new Date(endsAt).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  }
}

function Pad({ n }: { n: number }) {
  return <span>{String(n).padStart(2, '0')}</span>
}

export default function CountdownTimer({ endsAt, label = 'Sale ends in' }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(endsAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(endsAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [endsAt])

  if (timeLeft.expired) return null

  return (
    <div className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-sm font-medium"
      style={{ background: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-accent) 25%, transparent)' }}>
      <Clock size={15} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
      <span className="opacity-70">{label}:</span>
      <div className="flex items-center gap-1 font-bold tabular-nums" style={{ color: 'var(--brand-accent)' }}>
        {timeLeft.days > 0 && <><Pad n={timeLeft.days} /><span className="opacity-50 font-normal">d</span><span className="opacity-30">:</span></>}
        <Pad n={timeLeft.hours} /><span className="opacity-50 font-normal text-xs">h</span>
        <span className="opacity-30">:</span>
        <Pad n={timeLeft.minutes} /><span className="opacity-50 font-normal text-xs">m</span>
        <span className="opacity-30">:</span>
        <Pad n={timeLeft.seconds} /><span className="opacity-50 font-normal text-xs">s</span>
      </div>
    </div>
  )
}
