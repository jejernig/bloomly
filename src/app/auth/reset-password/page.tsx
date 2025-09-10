import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { AuthLayout } from '@/components/auth/AuthLayout'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Create a new secure password for your Bloomly.io account.',
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Choose a strong password to secure your boutique's Instagram content"
      showAuthToggle={false}
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}