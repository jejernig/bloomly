'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/useAuthStore'
import { showErrorToast, showSuccessToast } from '@/lib/api'
import { 
  User, 
  Settings, 
  CreditCard, 
  Shield, 
  Bell, 
  Key, 
  Instagram,
  Save,
  Upload,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Check,
  X,
  ExternalLink,
  AlertCircle,
  Crown
} from 'lucide-react'

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
    theme: 'light' | 'dark' | 'auto'
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
    profileVisibility: 'public' | 'private'
    shareAnalytics: boolean
    allowDataCollection: boolean
    twoFactorEnabled: boolean
  }
}

interface InstagramConnection {
  id: string
  username: string
  accountType: 'personal' | 'business' | 'creator'
  followerCount: number
  isActive: boolean
  connectedAt: string
}

interface APIKey {
  id: string
  name: string
  keyPreview: string
  permissions: string[]
  lastUsed: string
  createdAt: string
}

type SettingsTab = 'profile' | 'preferences' | 'instagram' | 'subscription' | 'privacy' | 'notifications' | 'api-keys'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      avatarUrl: user?.user_metadata?.avatar_url || '',
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
      shareAnalytics: false,
      allowDataCollection: true,
      twoFactorEnabled: false
    }
  })
  
  const [instagramAccounts] = useState<InstagramConnection[]>([
    {
      id: '1',
      username: '@bloomly_fashion',
      accountType: 'business',
      followerCount: 15420,
      isActive: true,
      connectedAt: '2024-01-15T10:30:00Z'
    }
  ])
  
  const [apiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API',
      keyPreview: 'bl_prod_••••••••••••1a2b',
      permissions: ['read', 'write', 'delete'],
      lastUsed: '2024-01-20T15:45:00Z',
      createdAt: '2024-01-10T09:00:00Z'
    },
    {
      id: '2',
      name: 'Mobile App API',
      keyPreview: 'bl_mobile_••••••••••••3c4d',
      permissions: ['read', 'write'],
      lastUsed: '2024-01-19T12:30:00Z',
      createdAt: '2024-01-12T14:20:00Z'
    }
  ])
  
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Authentication check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  // Initialize settings with user data
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          fullName: user.user_metadata?.full_name || '',
          email: user.email || '',
          avatarUrl: user.user_metadata?.avatar_url || ''
        }
      }))
    }
  }, [user])

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showSuccessToast('Settings saved successfully')
    } catch (error) {
      showErrorToast('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConnectInstagram = () => {
    // Mock Instagram OAuth flow
    showSuccessToast('Instagram connection initiated - this would redirect to Instagram OAuth')
  }

  const handleDisconnectInstagram = (accountId: string) => {
    showSuccessToast(`Instagram account disconnected`)
  }

  const handleCreateAPIKey = () => {
    showSuccessToast('API key creation - this would open a modal to create new API key')
  }

  const handleDeleteAPIKey = (keyId: string) => {
    showSuccessToast(`API key deleted`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api-keys', label: 'API Keys', icon: Key }
  ] as const

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and configurations</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                  
                  {/* Avatar */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-20 w-20 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                      {settings.profile.avatarUrl ? (
                        <img src={settings.profile.avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
                      ) : (
                        user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'
                      )}
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={settings.profile.fullName}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, fullName: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={settings.profile.bio}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, bio: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input
                        type="url"
                        value={settings.profile.website}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, website: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Preferences</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, timezone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, language: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="es-ES">Español</option>
                        <option value="fr-FR">Français</option>
                        <option value="de-DE">Deutsch</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                      <select
                        value={settings.preferences.theme}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, theme: e.target.value as 'light' | 'dark' | 'auto' }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Canvas Size</label>
                      <select
                        value={settings.preferences.defaultCanvasSize}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, defaultCanvasSize: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="1080x1080">Square (1080×1080)</option>
                        <option value="1080x1350">Portrait (1080×1350)</option>
                        <option value="1920x1080">Landscape (1920×1080)</option>
                        <option value="1080x1920">Story (1080×1920)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Auto Save</label>
                        <p className="text-xs text-gray-500">Automatically save your work every few minutes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.preferences.autoSave}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, autoSave: e.target.checked }
                        }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Grid Snap</label>
                        <p className="text-xs text-gray-500">Snap objects to grid for precise alignment</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.preferences.gridSnap}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, gridSnap: e.target.checked }
                        }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instagram Connections */}
            {activeTab === 'instagram' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Instagram Accounts</h2>
                  <p className="text-gray-600 mb-6">Connect your Instagram accounts to publish and schedule posts directly.</p>
                  
                  <div className="space-y-4">
                    {instagramAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            <Instagram className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{account.username}</h3>
                            <p className="text-sm text-gray-500 capitalize">{account.accountType} • {formatNumber(account.followerCount)} followers</p>
                            <p className="text-xs text-gray-400">Connected on {formatDate(account.connectedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 text-xs rounded-full ${
                            account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnectInstagram(account.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={handleConnectInstagram}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-center"
                    >
                      <Plus className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Connect Another Instagram Account</p>
                      <p className="text-xs text-gray-500">Add up to 3 Instagram accounts on Professional plan</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
                  
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Crown className="h-8 w-8 text-primary-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-primary-900 capitalize">Free Plan</h3>
                          <p className="text-primary-700">Active subscription</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-primary-300 text-primary-700 hover:bg-primary-100">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Manage Billing
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Usage Statistics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">This Month</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">AI Generations</span>
                          <span className="font-medium">23/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-primary-600 h-2 rounded-full" style={{width: '23%'}}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Projects</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Created</span>
                          <span className="font-medium">12/50</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-secondary-600 h-2 rounded-full" style={{width: '24%'}}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Instagram Accounts</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Connected</span>
                          <span className="font-medium">1/3</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-pink-600 h-2 rounded-full" style={{width: '33%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Upgrade Your Plan</h4>
                    <p className="text-gray-600 text-sm mb-4">Get access to unlimited projects, premium templates, and advanced AI features.</p>
                    <Button variant="gradient">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Enterprise
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-4">Profile Privacy</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                          <select
                            value={settings.privacy.profileVisibility}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              privacy: { ...prev.privacy, profileVisibility: e.target.value as 'public' | 'private' }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Control who can see your profile information</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Share Analytics Data</label>
                            <p className="text-xs text-gray-500">Help improve the platform by sharing anonymous usage data</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.privacy.shareAnalytics}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              privacy: { ...prev.privacy, shareAnalytics: e.target.checked }
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Allow Data Collection</label>
                            <p className="text-xs text-gray-500">Allow collection of usage data for product improvements</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.privacy.allowDataCollection}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              privacy: { ...prev.privacy, allowDataCollection: e.target.checked }
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-4">Security</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                            <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className={`px-2 py-1 text-xs rounded-full ${
                              settings.privacy.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {settings.privacy.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSettings(prev => ({
                                ...prev,
                                privacy: { ...prev.privacy, twoFactorEnabled: !prev.privacy.twoFactorEnabled }
                              }))}
                            >
                              {settings.privacy.twoFactorEnabled ? 'Disable' : 'Enable'}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Password</label>
                              <p className="text-xs text-gray-500">Last updated 3 months ago</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Change Password
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Active Sessions</label>
                              <p className="text-xs text-gray-500">Manage your active sessions across devices</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Sessions
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Project Updates</label>
                            <p className="text-xs text-gray-500">Get notified when projects are shared or updated</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications.email.projectUpdates}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                email: { ...prev.notifications.email, projectUpdates: e.target.checked }
                              }
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">AI Generation Complete</label>
                            <p className="text-xs text-gray-500">Notify when AI content generation is finished</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications.email.aiGenerationComplete}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                email: { ...prev.notifications.email, aiGenerationComplete: e.target.checked }
                              }
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Weekly Report</label>
                            <p className="text-xs text-gray-500">Weekly summary of your activity and performance</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications.email.weeklyReport}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                email: { ...prev.notifications.email, weeklyReport: e.target.checked }
                              }
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Security Alerts</label>
                            <p className="text-xs text-gray-500">Important security notifications (always enabled)</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications.email.securityAlerts}
                            disabled
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded opacity-50"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Promotional Emails</label>
                            <p className="text-xs text-gray-500">Updates about new features and special offers</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications.email.promotionalEmails}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                email: { ...prev.notifications.email, promotionalEmails: e.target.checked }
                              }
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-4">Push Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Post Scheduled</label>
                            <p className="text-xs text-gray-500">Notify when posts are successfully scheduled</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications.push.postScheduled}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                push: { ...prev.notifications.push, postScheduled: e.target.checked }
                              }
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Engagement Milestones</label>
                            <p className="text-xs text-gray-500">Celebrate when posts reach engagement goals</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications.push.engagementMilestones}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                push: { ...prev.notifications.push, engagementMilestones: e.target.checked }
                              }
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">System Maintenance</label>
                            <p className="text-xs text-gray-500">Important system updates and maintenance notifications</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications.push.systemMaintenance}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                push: { ...prev.notifications.push, systemMaintenance: e.target.checked }
                              }
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Keys */}
            {activeTab === 'api-keys' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
                      <p className="text-gray-600">Manage API keys for integrating with Bloomly.io</p>
                    </div>
                    <Button onClick={handleCreateAPIKey}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create API Key
                    </Button>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800">
                        Keep your API keys secure and never share them in client-side code or public repositories.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{key.name}</h3>
                            <p className="text-sm text-gray-500">Created on {formatDate(key.createdAt)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowApiKey(showApiKey === key.id ? null : key.id)}
                            >
                              {showApiKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAPIKey(key.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="bg-gray-100 rounded-md px-3 py-2 font-mono text-sm">
                            {showApiKey === key.id ? `bl_prod_1a2b3c4d5e6f7g8h9i0j` : key.keyPreview}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div>
                            <span className="mr-4">Permissions: {key.permissions.join(', ')}</span>
                            <span>Last used: {formatDate(key.lastUsed)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {apiKeys.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h3>
                      <p className="text-gray-600 mb-4">Create your first API key to start integrating with Bloomly.io</p>
                      <Button onClick={handleCreateAPIKey}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create API Key
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Changes are automatically saved</p>
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}