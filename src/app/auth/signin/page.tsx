import { Metadata } from 'next'
import { SignInForm } from '@/components/auth/SignInForm'
import { AuthLayout } from '@/components/auth/AuthLayout'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Bloomly.io account to create stunning Instagram content for your boutique.',
}

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue creating amazing Instagram content"
      showAuthToggle={true}
      authToggleText="Don't have an account?"
      authToggleLink="/auth/signup"
      authToggleLinkText="Sign up for free"
    >
      <SignInForm />
    </AuthLayout>
  )
}