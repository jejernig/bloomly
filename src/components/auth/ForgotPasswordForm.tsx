'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'react-hot-toast'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const { forgotPassword, isLoading } = useAuthStore()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const result = await forgotPassword(data.email)
      
      if (result.success) {
        setSubmittedEmail(data.email)
        setIsSubmitted(true)
        toast.success('Password reset email sent!')
      } else {
        toast.error(result.error || 'Failed to send password reset email')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Forgot password error:', error)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Check your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We&apos;ve sent a password reset link to{' '}
            <span className="font-medium text-gray-900">{submittedEmail}</span>
          </p>
        </div>

        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Didn&apos;t receive the email?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul role="list" className="list-disc space-y-1 pl-5">
                  <li>Check your spam folder</li>
                  <li>Make sure you entered the correct email address</li>
                  <li>It may take a few minutes to arrive</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => {
              setIsSubmitted(false)
              setSubmittedEmail('')
            }}
          >
            Try a different email
          </Button>

          <div className="text-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Forgot your password?</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          disabled={isLoading}
        >
          Send reset link
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/auth/signin"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}