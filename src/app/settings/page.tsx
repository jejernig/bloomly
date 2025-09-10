'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  HelpCircle,
  LogOut,
  ArrowLeft,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react'
import { clsx } from 'clsx'
import { toast } from 'react-hot-toast'

type SettingsTab = 'profile' | 'preferences' | 'notifications' | 'privacy' | 'billing'

interface UserSettings {
  profile: {
    fullName: string
    email: string
    avatarUrl: string
    bio: string
    website: string
  }
  preferences: {
    timezone: string
    language: string
    theme: 'light' | 'dark' | 'system'
    defaultCanvasSize: string
    autoSave: boolean
    gridSnap: boolean
  }
  notifications: {
    email: {
      projectUpdates: boolean
      aiGenerationComplete: boolean
      weeklyReport: boolean
      securityAlerts: boolean
      promotionalEmails: boolean
    }
    push: {
      postScheduled: boolean
      engagementMilestones: boolean
      systemMaintenance: boolean
    }
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends'
    allowIndexing: boolean
    dataProcessing: boolean
    analytics: boolean
  }
}

const settingsTabs = [
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'preferences' as const, label: 'Preferences', icon: SettingsIcon },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  { id: 'privacy' as const, label: 'Privacy', icon: Shield },
  { id: 'billing' as const, label: 'Billing', icon: Globe },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      avatarUrl: '',
      bio: '',
      website: ''
    },
    preferences: {
      timezone: 'UTC',
      language: 'en-US',
      theme: 'light',
      defaultCanvasSize: '1080x1080',
      autoSave: true,
      gridSnap: true
    },
    notifications: {
      email: {
        projectUpdates: true,
        aiGenerationComplete: true,
        weeklyReport: false,
        securityAlerts: true,
        promotionalEmails: false
      },
      push: {
        postScheduled: true,
        engagementMilestones: true,
        systemMaintenance: true
      }
    },
    privacy: {
      profileVisibility: 'private',
      allowIndexing: false,
      dataProcessing: true,
      analytics: true
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Initialize settings when user data loads
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          fullName: user.fullName || '',
          email: user.email || '',
        }
      }))
    }
  }, [user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    try {
      // In a real app, this would delete the account
      toast.success('Account deletion initiated. Check your email for confirmation.')
      setShowDeleteConfirm(false)
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  const updateSettings = <K extends keyof UserSettings>(
    category: K,
    updates: Partial<UserSettings[K]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates
      }
    }))
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        
        {/* Avatar Upload */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
            {settings.profile.avatarUrl ? (
              <img
                src={settings.profile.avatarUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-primary-600" />
            )}
          </div>
          <div>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <Input
              value={settings.profile.fullName}
              onChange={(e) => updateSettings('profile', { fullName: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input
              value={settings.profile.email}
              onChange={(e) => updateSettings('profile', { email: e.target.value })}
              type="email"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={settings.profile.bio}
            onChange={(e) => updateSettings('profile', { bio: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={3}
            placeholder="Tell us about yourself"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <Input
            value={settings.profile.website}
            onChange={(e) => updateSettings('profile', { website: e.target.value })}
            placeholder="https://your-website.com"
          />
        </div>
      </div>
    </div>
  )

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.preferences.timezone}
              onChange={(e) => updateSettings('preferences', { timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.preferences.language}
              onChange={(e) => updateSettings('preferences', { language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <select
            value={settings.preferences.theme}
            onChange={(e) => updateSettings('preferences', { theme: e.target.value as 'light' | 'dark' | 'system' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Canvas Size</label>
          <select
            value={settings.preferences.defaultCanvasSize}
            onChange={(e) => updateSettings('preferences', { defaultCanvasSize: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="1080x1080">Instagram Post (1080x1080)</option>
            <option value="1080x1350">Instagram Story (1080x1350)</option>
            <option value="1200x630">Facebook Post (1200x630)</option>
            <option value="1024x512">Twitter Header (1024x512)</option>
            <option value="custom">Custom Size</option>
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto Save</label>
              <p className="text-sm text-gray-500">Automatically save your work every few minutes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.preferences.autoSave}
              onChange={(e) => updateSettings('preferences', { autoSave: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Grid Snap</label>
              <p className="text-sm text-gray-500">Snap objects to grid when moving or resizing</p>
            </div>
            <input
              type="checkbox"
              checked={settings.preferences.gridSnap}
              onChange={(e) => updateSettings('preferences', { gridSnap: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Project Updates</label>
              <p className="text-sm text-gray-500">Get notified about project changes and updates</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.email.projectUpdates}
              onChange={(e) => updateSettings('notifications', {
                email: { ...settings.notifications.email, projectUpdates: e.target.checked }
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">AI Generation Complete</label>
              <p className="text-sm text-gray-500">Get notified when AI image generation is finished</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.email.aiGenerationComplete}
              onChange={(e) => updateSettings('notifications', {
                email: { ...settings.notifications.email, aiGenerationComplete: e.target.checked }
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Security Alerts</label>
              <p className="text-sm text-gray-500">Important security notifications (recommended)</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.email.securityAlerts}
              onChange={(e) => updateSettings('notifications', {
                email: { ...settings.notifications.email, securityAlerts: e.target.checked }
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => updateSettings('privacy', { profileVisibility: e.target.value as 'public' | 'private' | 'friends' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Allow Search Engine Indexing</label>
              <p className="text-sm text-gray-500">Let search engines find your public content</p>
            </div>
            <input
              type="checkbox"
              checked={settings.privacy.allowIndexing}
              onChange={(e) => updateSettings('privacy', { allowIndexing: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Data Processing</label>
              <p className="text-sm text-gray-500">Allow data processing for service improvement</p>
            </div>
            <input
              type="checkbox"
              checked={settings.privacy.dataProcessing}
              onChange={(e) => updateSettings('privacy', { dataProcessing: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-red-800">Delete Account</h4>
              <p className="text-sm text-red-600">Permanently delete your account and all data</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete Account
            </Button>
          </div>
          
          {showDeleteConfirm && (
            <div className="mt-4 p-3 bg-white border border-red-300 rounded">
              <p className="text-sm text-gray-700 mb-3">
                Are you sure? This action cannot be undone and will permanently delete your account and all associated data.
              </p>
              <div className="flex space-x-3">
                <Button
                  size="sm"
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Delete Account
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-primary-800">Free Plan</h4>
              <p className="text-sm text-primary-600">Up to 10 projects, basic features</p>
            </div>
            <Button variant="gradient">
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No billing history available for free plan.</p>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'preferences':
        return renderPreferencesTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'privacy':
        return renderPrivacyTab()
      case 'billing':
        return renderBillingTab()
      default:
        return renderProfileTab()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {renderTabContent()}
              
              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="min-w-[100px]"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}