'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'react-hot-toast'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch('password')

  // Extract token from URL parameters
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token') || searchParams.get('access_token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      // If no token is found, redirect to forgot password page
      toast.error('Invalid or missing reset token')
      router.push('/auth/forgot-password')
    }
  }, [searchParams, router])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token')
      return
    }

    try {
      const result = await resetPassword(token, data.password)
      
      if (result.success) {
        setIsSuccess(true)
        toast.success('Password reset successfully!')
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        toast.error(result.error || 'Failed to reset password')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Reset password error:', error)
    }
  }

  // Show loading state while extracting token
  if (token === null) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
          <p className="mt-2 text-sm text-gray-600">
            Verifying your reset token...
          </p>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Password reset successful!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your password has been updated. You&apos;ll be redirected to your dashboard shortly.
          </p>
        </div>

        <Button
          type="button"
          variant="gradient"
          size="lg"
          className="w-full"
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </div>
    )
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) { return { score: 0, label: '', color: '' } }
    
    let score = 0
    if (password.length >= 8) { score++ }
    if (/[a-z]/.test(password)) { score++ }
    if (/[A-Z]/.test(password)) { score++ }
    if (/\d/.test(password)) { score++ }
    if (/[^a-zA-Z0-9]/.test(password)) { score++ }

    if (score <= 2) { return { score, label: 'Weak', color: 'bg-red-500' } }
    if (score <= 3) { return { score, label: 'Fair', color: 'bg-yellow-500' } }
    if (score <= 4) { return { score, label: 'Good', color: 'bg-blue-500' } }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your new password to complete the reset process.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="New password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your new password"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          
          {/* Password strength indicator */}
          {password && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Password strength:</span>
                <span className={`font-medium ${
                  passwordStrength.score <= 2 ? 'text-red-600' : 
                  passwordStrength.score <= 3 ? 'text-yellow-600' : 
                  passwordStrength.score <= 4 ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm your new password"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="rounded-md bg-blue-50 p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Password requirements:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                password && password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              At least 8 characters
            </li>
            <li className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                password && /[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              One lowercase letter
            </li>
            <li className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                password && /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              One uppercase letter
            </li>
            <li className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                password && /\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              One number
            </li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          disabled={isLoading}
        >
          Update password
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/auth/signin"
          className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}