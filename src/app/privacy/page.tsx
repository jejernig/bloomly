import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Bloomly.io - Comprehensive GDPR and CCPA compliant data protection practices for our AI-powered Instagram content creation platform.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction and Data Controller Information</h2>
              <p className="text-gray-700 mb-4">
                Bloomly.io (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered Instagram content creation platform for fashion boutiques (&ldquo;Service,&rdquo; &ldquo;Platform&rdquo;).
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">1.1 Data Controller Identity</h3>
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <p className="text-gray-700"><strong>Company Name:</strong> Bloomly.io</p>
                <p className="text-gray-700"><strong>Email:</strong> privacy@taylorcollection.com</p>
                <p className="text-gray-700"><strong>Website:</strong> https://taylorcollection.app</p>
                <p className="text-gray-700"><strong>Data Protection Officer:</strong> Available upon request</p>
              </div>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">1.2 Scope of This Policy</h3>
              <p className="text-gray-700 mb-4">This Privacy Policy applies to all users of our Service, including:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 pl-4">
                <li>Fashion boutique owners and staff</li>
                <li>Content creators and marketers</li>
                <li>Website visitors and prospective customers</li>
                <li>API users and integration partners</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Information You Provide Directly</h3>
              <p className="text-gray-700 mb-4">We collect information you provide directly when using our Service:</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Account Information</h4>
                  <ul className="list-disc list-inside text-blue-800 text-sm">
                    <li>Full name and business name</li>
                    <li>Email address and phone number</li>
                    <li>Business address and contact details</li>
                    <li>Payment information (via third-party providers)</li>
                    <li>Professional role and company size</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-2">Content and Preferences</h4>
                  <ul className="list-disc list-inside text-green-800 text-sm">
                    <li>Instagram content and captions you create</li>
                    <li>Images, graphics, and design assets</li>
                    <li>Brand preferences and style guidelines</li>
                    <li>Marketing goals and campaign objectives</li>
                    <li>Support communications and feedback</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Information Collected Automatically</h3>
              <p className="text-gray-700 mb-4">We automatically collect certain information when you use our Service:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 pl-4">
                <li>Usage and analytics data (pages visited, features used, engagement metrics)</li>
                <li>Technical data (browser type, device identifiers, IP address)</li>
                <li>Cookies and tracking technologies for functionality and analytics</li>
              </ul>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Information from Third-Party Sources</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Instagram Business API</h4>
                  <ul className="list-disc list-inside text-purple-800 text-sm">
                    <li>Account information and statistics</li>
                    <li>Content performance metrics</li>
                    <li>Audience demographics</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Google OAuth</h4>
                  <ul className="list-disc list-inside text-orange-800 text-sm">
                    <li>Basic profile information</li>
                    <li>Account verification status</li>
                    <li>Authentication tokens</li>
                  </ul>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-900 mb-2">Payment Processors</h4>
                  <ul className="list-disc list-inside text-indigo-800 text-sm">
                    <li>Transaction history and billing</li>
                    <li>Payment method verification</li>
                    <li>Subscription status</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your personal information for the following purposes:</p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Service Provision</h3>
                  <ul className="list-disc list-inside text-blue-800">
                    <li>Account creation and authentication</li>
                    <li>AI-powered design tools and content creation</li>
                    <li>Instagram integration and publishing</li>
                    <li>Performance analytics and insights</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border-l-4 border-green-400 p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">AI-Powered Services</h3>
                  <ul className="list-disc list-inside text-green-800">
                    <li>Content generation and design suggestions</li>
                    <li>Personalization and template customization</li>
                    <li>Performance optimization and trend analysis</li>
                    <li>Machine learning model improvement</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 border-l-4 border-purple-400 p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Communication & Support</h3>
                  <ul className="list-disc list-inside text-purple-800">
                    <li>Customer support and technical assistance</li>
                    <li>Service updates and feature announcements</li>
                    <li>Educational content and best practices</li>
                    <li>Community features and collaboration</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Your Privacy Rights</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">GDPR Rights (EU/EEA Users)</h3>
                  <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                    <li><strong>Right of Access:</strong> Request copies of your personal data</li>
                    <li><strong>Right to Rectification:</strong> Correct inaccurate information</li>
                    <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
                    <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                    <li><strong>Right to Data Portability:</strong> Export your data</li>
                    <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">CCPA Rights (California Users)</h3>
                  <ul className="list-disc list-inside text-green-800 text-sm space-y-1">
                    <li><strong>Right to Know:</strong> Categories and sources of personal information</li>
                    <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                    <li><strong>Right to Correct:</strong> Correct inaccurate personal information</li>
                    <li><strong>Right to Opt-Out:</strong> Opt-out of sale and targeted advertising</li>
                    <li><strong>Right to Portability:</strong> Receive data in portable format</li>
                    <li><strong>Non-Discrimination:</strong> No discrimination for exercising rights</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Exercise Your Rights</h3>
                <p className="text-gray-700 mb-3">Contact us to exercise your privacy rights:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700"><strong>Email:</strong> privacy@taylorcollection.app</p>
                    <p className="text-gray-700"><strong>Support:</strong> support@taylorcollection.app</p>
                  </div>
                  <div>
                    <p className="text-gray-700"><strong>Response Time:</strong> Within 30 days (GDPR) or 45 days (CCPA)</p>
                    <p className="text-gray-700"><strong>Identity Verification:</strong> May be required for security</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security and Protection</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">Technical Safeguards</h3>
                  <ul className="list-disc list-inside text-red-800 text-sm">
                    <li><strong>Encryption:</strong> TLS 1.3 in transit, AES-256 at rest</li>
                    <li><strong>Access Controls:</strong> Role-based access and multi-factor authentication</li>
                    <li><strong>Infrastructure:</strong> SOC 2 Type II compliant cloud providers</li>
                    <li><strong>Monitoring:</strong> 24/7 security monitoring and threat detection</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">Organizational Safeguards</h3>
                  <ul className="list-disc list-inside text-yellow-800 text-sm">
                    <li><strong>Privacy by Design:</strong> Default privacy-protective settings</li>
                    <li><strong>Staff Training:</strong> Annual privacy and security training</li>
                    <li><strong>Vendor Management:</strong> Third-party security assessments</li>
                    <li><strong>Incident Response:</strong> Comprehensive breach notification procedures</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">We use cookies and similar technologies to improve your experience:</p>
              
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Essential Cookies (Always Active)</h4>
                  <p className="text-green-800 text-sm">Authentication, security, platform functionality, and user preferences</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Analytics Cookies (With Consent)</h4>
                  <p className="text-blue-800 text-sm">Google Analytics, user behavior analysis, A/B testing, and performance optimization</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Marketing Cookies (With Consent)</h4>
                  <p className="text-purple-800 text-sm">Social media integration, advertising personalization, and retargeting</p>
                </div>
              </div>
              
              <p className="text-gray-700 mt-4">
                You can manage cookie preferences through our consent management platform or your browser settings. We respect Do Not Track signals and Global Privacy Control (GPC) preferences.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention and International Transfers</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">Data Retention</h3>
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Active Accounts:</strong> Retained while account remains active</li>
                  <li><strong>Inactive Accounts:</strong> Deleted after 3 years of inactivity</li>
                  <li><strong>Closed Accounts:</strong> Core data deleted within 30 days</li>
                  <li><strong>Transaction Records:</strong> Retained for 7 years for tax purposes</li>
                  <li><strong>Analytics Data:</strong> Aggregated data for 5 years, personal data for 2 years</li>
                </ul>
              </div>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">International Data Transfers</h3>
              <p className="text-gray-700 mb-4">
                Your data may be processed in the United States and other countries. We use appropriate safeguards including Standard Contractual Clauses (SCCs) and adequacy decisions to protect your information during international transfers.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                For questions about this Privacy Policy or to exercise your privacy rights, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700"><strong>Email:</strong> privacy@taylorcollection.app</p>
                <p className="text-gray-700"><strong>Support:</strong> support@taylorcollection.app</p>
                <p className="text-gray-700"><strong>Website:</strong> https://taylorcollection.app</p>
              </div>
            </section>

            {/* Footer Notice */}
            <div className="border-t border-gray-200 pt-8">
              <p className="text-sm text-gray-500 text-center">
                <strong>Legal Notice:</strong> This Privacy Policy describes our comprehensive data protection practices 
                in compliance with GDPR, CCPA, and SOC 2 requirements. We are committed to protecting your privacy 
                and ensuring transparent data processing for our AI-powered fashion marketing platform.
              </p>
              <p className="text-xs text-gray-400 text-center mt-4">
                Last updated: {currentDate} | This policy may be updated periodically with advance notice.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link 
            href="/terms" 
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            View Terms of Service
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