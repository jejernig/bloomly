'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignInFormData = z.infer<typeof signInSchema>

export function SignInForm() {
  const router = useRouter()
  const { signIn, signInWithGoogle, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    console.log('🔐 SignInForm: onSubmit called with:', data.email)
    try {
      console.log('🔐 SignInForm: Calling signIn...')
      const result = await signIn(data.email, data.password)
      console.log('🔐 SignInForm: signIn result:', result)
      
      if (result.success) {
        console.log('🔐 SignInForm: Success! Showing toast and navigating...')
        toast.success('Welcome back!')
        router.push('/dashboard')
        console.log('🔐 SignInForm: router.push called')
      } else {
        console.log('🔐 SignInForm: Sign in failed:', result.error)
        toast.error(result.error || 'Failed to sign in')
      }
    } catch (error) {
      console.log('🔐 SignInForm: Exception caught:', error)
      toast.error('An unexpected error occurred')
      console.error('Sign in error:', error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle()
      
      if (result.success) {
        // Redirect will be handled by the callback
        toast.success('Redirecting to Google...')
      } else {
        toast.error(result.error || 'Failed to sign in with Google')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Google sign in error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Google Sign In Button */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
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

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              autoComplete="off"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          Sign in
        </Button>
      </form>
    </div>
  )
}