import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Bloomly.io - AI-powered Instagram content creation platform for fashion boutiques.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfServicePage() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Bloomly.io
          </Link>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <div className="text-sm text-gray-600">
              <p><strong>Effective Date:</strong> {currentDate}</p>
              <p><strong>Last Updated:</strong> {currentDate}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 prose prose-lg max-w-none">
          <div className="legal-content">
            
            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using Bloomly.io (&ldquo;Service,&rdquo; &ldquo;Platform,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you may not access or use our Service.
              </p>
              <p className="text-gray-700">
                Bloomly.io provides AI-powered Instagram content creation tools and services specifically designed for fashion boutiques and retailers (&ldquo;Services&rdquo;). These Terms govern your use of our website, mobile application, AI design tools, content creation features, and all related services.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Core Services</h3>
              <p className="text-gray-700 mb-4">Bloomly.io provides:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 pl-4">
                <li>AI-powered design tools and content templates for fashion marketing</li>
                <li>Instagram post creation, scheduling, and publishing capabilities</li>
                <li>Content management and organization tools</li>
                <li>Analytics and performance tracking for Instagram content</li>
                <li>Template libraries and design assets</li>
                <li>Integration with Instagram Business APIs</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 AI-Generated Content</h3>
              <p className="text-gray-700 mb-4">Our Service utilizes artificial intelligence and machine learning technologies to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 pl-4">
                <li>Generate design suggestions and content layouts</li>
                <li>Create personalized templates based on your brand preferences</li>
                <li>Optimize content for Instagram engagement</li>
                <li>Provide automated content recommendations</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Third-Party Integrations</h3>
              <p className="text-gray-700 mb-4">Our Service integrates with:</p>
              <ul className="list-disc list-inside text-gray-700 pl-4">
                <li>Instagram Business API for content publishing</li>
                <li>Google OAuth for authentication services</li>
                <li>Payment processing providers for subscription management</li>
                <li>Cloud storage services for data processing and storage</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 mb-4">To use our Service, you must:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 pl-4">
                <li>Create an account by providing accurate and complete information</li>
                <li>Maintain the security and confidentiality of your login credentials</li>
                <li>Be at least 18 years old or have parental consent</li>
                <li>Represent a legitimate business entity for commercial use</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Authentication Methods</h3>
              <p className="text-gray-700 mb-4">We offer account access through:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 pl-4">
                <li>Email and password authentication</li>
                <li>Google OAuth integration</li>
                <li>You are responsible for maintaining the security of all authentication methods</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.3 Account Responsibilities</h3>
              <p className="text-gray-700 mb-4">You agree to:</p>
              <ul className="list-disc list-inside text-gray-700 pl-4">
                <li>Provide accurate, current, and complete account information</li>
                <li>Update your information promptly when changes occur</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Use your account only for lawful business purposes</li>
              </ul>
            </section>

            {/* Key Sections Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Complete Terms Available</h3>
              <p className="text-blue-800">
                This page contains the key sections of our Terms of Service. The complete document includes additional important sections covering:
              </p>
              <ul className="list-disc list-inside text-blue-800 mt-3 pl-4">
                <li>Subscription and Payment Terms</li>
                <li>Acceptable Use Policy</li>
                <li>Intellectual Property Rights</li>
                <li>Privacy and Data Protection</li>
                <li>AI Content and Disclaimers</li>
                <li>Service Availability and Modifications</li>
                <li>Limitation of Liability</li>
                <li>And more...</li>
              </ul>
            </div>

            {/* Important Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Legal Provisions</h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-amber-900 mb-3">AI Content Disclaimer</h3>
                <p className="text-amber-800">
                  Our AI-powered tools generate suggestions based on machine learning algorithms. You are responsible for reviewing and approving all content before publication. We do not guarantee specific results or performance.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-red-900 mb-3">Limitation of Liability</h3>
                <p className="text-red-800">
                  THE SERVICE IS PROVIDED &ldquo;AS-IS&rdquo; AND &ldquo;AS-AVAILABLE&rdquo; WITHOUT WARRANTIES. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Your Content Rights</h3>
                <p className="text-green-800">
                  You retain ownership of content you create using our AI tools. We provide you with a license to use AI-generated suggestions and templates for your business purposes.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700"><strong>Email:</strong> legal@bloomly.io</p>
                <p className="text-gray-700"><strong>Support:</strong> support@bloomly.io</p>
                <p className="text-gray-700"><strong>Website:</strong> https://bloomly.io</p>
              </div>
            </section>

            {/* Footer Notice */}
            <div className="border-t border-gray-200 pt-8">
              <p className="text-sm text-gray-500 text-center">
                <strong>Legal Notice:</strong> This document contains key provisions from our complete Terms of Service. 
                These terms are designed to protect both Bloomly.io and our users while enabling innovative 
                AI-powered content creation for fashion businesses. Please read all terms carefully.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link 
            href="/privacy" 
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            View Privacy Policy
          </Link>
          <Link 
            href="/" 
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}