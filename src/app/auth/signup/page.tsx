import { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { AuthLayout } from '@/components/auth/AuthLayout'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your Taylor Collection account and start creating stunning Instagram content for your boutique.',
}

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Get started today"
      subtitle="Create your account and transform your boutique's Instagram presence"
      showAuthToggle={true}
      authToggleText="Already have an account?"
      authToggleLink="/auth/signin"
      authToggleLinkText="Sign in"
    >
      <SignUpForm />
    </AuthLayout>
  )
}