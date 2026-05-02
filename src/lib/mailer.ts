import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'
import React from 'react'
import {
  OrderConfirmationEmail, OrderConfirmationProps,
  LowStockAlertEmail, LowStockAlertProps,
  AbandonedCartEmail, AbandonedCartProps,
  NewsletterWelcomeEmail,
} from './emails'

async function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

async function getStoreEmail() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('store_settings')
    .select('store_name,contact_email,accent_color')
    .single()
  return {
    storeName: data?.store_name || 'Our Store',
    fromEmail: data?.contact_email || 'noreply@ecomhero.app',
    accentColor: data?.accent_color || '#6366f1',
  }
}

export async function sendOrderConfirmation(props: Omit<OrderConfirmationProps, 'storeName' | 'accentColor' | 'storeUrl'> & { to: string }) {
  try {
    const resend = await getResend()
    if (!resend) return
    const { storeName, fromEmail, accentColor } = await getStoreEmail()
    const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecom-hero.vercel.app'

    await resend.emails.send({
      from: `${storeName} <${fromEmail}>`,
      to: props.to,
      subject: `Order confirmed — #${props.orderNumber}`,
      react: React.createElement(OrderConfirmationEmail, { ...props, storeName, accentColor, storeUrl }),
    })
  } catch (e) {
    console.error('Order confirmation email error:', e)
  }
}

export async function sendLowStockAlert(props: Omit<LowStockAlertProps, 'storeName' | 'accentColor' | 'adminUrl'>) {
  try {
    const resend = await getResend()
    if (!resend) return
    const { storeName, fromEmail } = await getStoreEmail()
    const adminUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecom-hero.vercel.app'

    await resend.emails.send({
      from: `${storeName} <${fromEmail}>`,
      to: fromEmail,
      subject: `⚠️ Low stock alert — ${props.products.length} product${props.products.length !== 1 ? 's' : ''} need restocking`,
      react: React.createElement(LowStockAlertEmail, { ...props, storeName, accentColor: '#f59e0b', adminUrl }),
    })
  } catch (e) {
    console.error('Low stock alert email error:', e)
  }
}

export async function sendAbandonedCart(props: Omit<AbandonedCartProps, 'storeName' | 'accentColor' | 'storeUrl'> & { to: string }) {
  try {
    const resend = await getResend()
    if (!resend) return
    const { storeName, fromEmail, accentColor } = await getStoreEmail()
    const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecom-hero.vercel.app'

    await resend.emails.send({
      from: `${storeName} <${fromEmail}>`,
      to: props.to,
      subject: `You left something behind at ${storeName} 🛒`,
      react: React.createElement(AbandonedCartEmail, { ...props, storeName, accentColor, storeUrl }),
    })
  } catch (e) {
    console.error('Abandoned cart email error:', e)
  }
}

export async function sendNewsletterWelcome(to: string) {
  try {
    const resend = await getResend()
    if (!resend) return
    const { storeName, fromEmail, accentColor } = await getStoreEmail()
    const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecom-hero.vercel.app'

    await resend.emails.send({
      from: `${storeName} <${fromEmail}>`,
      to,
      subject: `Welcome to ${storeName}! 👋`,
      react: React.createElement(NewsletterWelcomeEmail, { storeName, accentColor, storeUrl }),
    })
  } catch (e) {
    console.error('Newsletter welcome email error:', e)
  }
}


async function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

async function getStoreEmail() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('store_settings')
    .select('store_name,contact_email,accent_color')
    .single()
  return {
    storeName: data?.store_name || 'Our Store',
    fromEmail: data?.contact_email || 'noreply@ecomhero.app',
    accentColor: data?.accent_color || '#6366f1',
  }
}

export async function sendOrderConfirmation(props: Omit<OrderConfirmationProps, 'storeName' | 'accentColor' | 'storeUrl'> & { to: string }) {
  try {
    const resend = await getResend()
    if (!resend) return
    const { storeName, fromEmail, accentColor } = await getStoreEmail()
    const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecom-hero.vercel.app'

    const html = renderToStaticMarkup(
      React.createElement(OrderConfirmationEmail, { ...props, storeName, accentColor, storeUrl })
    )

    await resend.emails.send({
      from: `${storeName} <${fromEmail}>`,
      to: props.to,
      subject: `Order confirmed — #${props.orderNumber}`,
      html,
    })
  } catch (e) {
    console.error('Order confirmation email error:', e)
  }
}

export async function sendLowStockAlert(props: Omit<LowStockAlertProps, 'storeName' | 'accentColor' | 'adminUrl'>) {
  try {
    const resend = await getResend()
    if (!resend) return
    const { storeName, fromEmail } = await getStoreEmail()
    const adminUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecom-hero.vercel.app'

    const html = renderToStaticMarkup(
      React.createElement(LowStockAlertEmail, { ...props, storeName, accentColor: '#f59e0b', adminUrl })
    )

    await resend.emails.send({
      from: `${storeName} <${fromEmail}>`,
      to: fromEmail,
      subject: `⚠️ Low stock alert — ${props.products.length} product${props.products.length !== 1 ? 's' : ''} need restocking`,
      html,
    })
  } catch (e) {
    console.error('Low stock alert email error:', e)
  }
}

export async function sendAbandonedCart(props: Omit<AbandonedCartProps, 'storeName' | 'accentColor' | 'storeUrl'> & { to: string }) {
  try {
    const resend = await getResend()
    if (!resend) return
    const { storeName, fromEmail, accentColor } = await getStoreEmail()
    const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecom-hero.vercel.app'

    const html = renderToStaticMarkup(
      React.createElement(AbandonedCartEmail, { ...props, storeName, accentColor, storeUrl })
    )

    await resend.emails.send({
      from: `${storeName} <${fromEmail}>`,
      to: props.to,
      subject: `You left something behind at ${storeName} 🛒`,
      html,
    })
  } catch (e) {
    console.error('Abandoned cart email error:', e)
  }
}

export async function sendNewsletterWelcome(to: string) {
  try {
    const resend = await getResend()
    if (!resend) return
    const { storeName, fromEmail, accentColor } = await getStoreEmail()
    const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecom-hero.vercel.app'

    const html = renderToStaticMarkup(
      React.createElement(NewsletterWelcomeEmail, { storeName, accentColor, storeUrl })
    )

    await resend.emails.send({
      from: `${storeName} <${fromEmail}>`,
      to,
      subject: `Welcome to ${storeName}! 👋`,
      html,
    })
  } catch (e) {
    console.error('Newsletter welcome email error:', e)
  }
}
