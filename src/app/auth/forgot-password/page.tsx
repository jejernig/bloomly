import { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { AuthLayout } from '@/components/auth/AuthLayout'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your Bloomly.io account password to regain access to your Instagram content creation tools.',
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Password Recovery"
      subtitle="Get back to creating amazing Instagram content for your boutique"
      showAuthToggle={true}
      authToggleText="Remember your password?"
      authToggleLink="/auth/signin"
      authToggleLinkText="Sign in"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}