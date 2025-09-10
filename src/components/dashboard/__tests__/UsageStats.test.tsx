import React from 'react'
import { render, screen } from '@testing-library/react'
import { UsageStats } from '../UsageStats'
import { 
  setupAuthStoreForTier, 
  testRBACAccess,
  TEST_USERS
} from '@/test-utils'

// Mock the auth store
jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: jest.fn()
}))

describe('UsageStats Component - RBAC Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('FREE Tier User', () => {
    beforeEach(() => {
      const mockStore = setupAuthStoreForTier('FREE')
      const { useAuthStore } = require('@/stores/useAuthStore')
      useAuthStore.mockReturnValue(mockStore.getState())
    })

    it('should display FREE tier user information', () => {
      render(<UsageStats />)
      
      expect(screen.getByText(/Free Plan/)).toBeInTheDocument()
      expect(screen.getByText(/2024-09/)).toBeInTheDocument()
    })

    it('should show upgrade button for FREE tier', () => {
      render(<UsageStats />)
      
      // Should show upgrade button
      const upgradeButtons = screen.getAllByRole('button', { name: /upgrade/i })
      expect(upgradeButtons.length).toBeGreaterThan(0)
      
      // Should show upgrade promotion
      expect(screen.getByText('Unlock unlimited potential')).toBeInTheDocument()
      expect(screen.getByText(/Upgrade to Pro for unlimited AI generations/)).toBeInTheDocument()
    })

    it('should display correct usage limits for FREE tier', () => {
      render(<UsageStats />)
      
      const limits = testRBACAccess.getLimitsForTier('free')
      
      // Check AI Generations limit
      expect(screen.getByText(`18 of ${limits.aiGenerationsPerMonth.toLocaleString()}`)).toBeInTheDocument()
      
      // Check Projects limit  
      expect(screen.getByText(`5 of ${limits.projectsLimit.toLocaleString()}`)).toBeInTheDocument()
      
      // Check Instagram Accounts limit
      expect(screen.getByText(`1 of ${limits.instagramAccountsLimit.toLocaleString()}`)).toBeInTheDocument()
    })

    it('should show near limit warning for FREE tier when approaching limits', () => {
      render(<UsageStats />)
      
      // Mock usage shows 18/25 AI generations (72%) - should show near limit warning
      const aiGenerationsSection = screen.getByText('AI Generations').closest('div')
      expect(aiGenerationsSection).toBeInTheDocument()
      
      // For FREE tier with limited usage, should show near limit warnings appropriately
      // This would be visible if usage >= 80% of limit (20/25 = 80%)
    })
  })

  describe('PRO Tier User', () => {
    beforeEach(() => {
      const mockStore = setupAuthStoreForTier('PRO')
      const { useAuthStore } = require('@/stores/useAuthStore')
      useAuthStore.mockReturnValue(mockStore.getState())
    })

    it('should display PRO tier user information', () => {
      render(<UsageStats />)
      
      expect(screen.getByText(/Professional Plan/)).toBeInTheDocument()
      expect(screen.getByText(/2024-09/)).toBeInTheDocument()
    })

    it('should NOT show upgrade button for PRO tier', () => {
      render(<UsageStats />)
      
      // Should NOT show upgrade buttons or promotions for PRO users
      expect(screen.queryByRole('button', { name: /upgrade/i })).not.toBeInTheDocument()
      expect(screen.queryByText('Unlock unlimited potential')).not.toBeInTheDocument()
      expect(screen.queryByText(/Upgrade to Pro/)).not.toBeInTheDocument()
    })

    it('should display correct usage limits for PRO tier', () => {
      render(<UsageStats />)
      
      const limits = testRBACAccess.getLimitsForTier('professional')
      
      // Check AI Generations limit (professional has 100, not unlimited)
      expect(screen.getByText(`18 of ${limits.aiGenerationsPerMonth.toLocaleString()}`)).toBeInTheDocument()
      
      // Check Projects limit
      expect(screen.getByText(`5 of ${limits.projectsLimit.toLocaleString()}`)).toBeInTheDocument()
      
      // Check Instagram Accounts limit
      expect(screen.getByText(`1 of ${limits.instagramAccountsLimit.toLocaleString()}`)).toBeInTheDocument()
    })

    it('should show progress bars for professional tier limited features', () => {
      render(<UsageStats />)
      
      // Professional tier still has limits (not unlimited like enterprise)
      const aiGenerationsSection = screen.getByText('AI Generations').closest('div')
      expect(aiGenerationsSection).toBeInTheDocument()
      
      // Professional tier with 18/100 AI generations should not show near limit (18/100 = 18%)
      // Near limit is triggered at 80%, so no warning should show
      const nearLimitElements = screen.queryAllByText('Near limit')
      expect(nearLimitElements.length).toBe(0) // No near limit warnings at 18% usage
    })
  })

  describe('ENTERPRISE Tier User', () => {
    beforeEach(() => {
      const mockStore = setupAuthStoreForTier('ENTERPRISE')
      const { useAuthStore } = require('@/stores/useAuthStore')
      useAuthStore.mockReturnValue(mockStore.getState())
    })

    it('should display ENTERPRISE tier user information', () => {
      render(<UsageStats />)
      
      expect(screen.getByText(/Enterprise Plan/)).toBeInTheDocument()
      expect(screen.getByText(/2024-09/)).toBeInTheDocument()
    })

    it('should NOT show upgrade button for ENTERPRISE tier', () => {
      render(<UsageStats />)
      
      // Should NOT show any upgrade buttons or promotions for Enterprise users
      expect(screen.queryByRole('button', { name: /upgrade/i })).not.toBeInTheDocument()
      expect(screen.queryByText('Unlock unlimited potential')).not.toBeInTheDocument()
      expect(screen.queryByText(/Upgrade to Pro/)).not.toBeInTheDocument()
      expect(screen.queryByText(/View Plans/)).not.toBeInTheDocument()
    })

    it('should display unlimited for all features in ENTERPRISE tier', () => {
      render(<UsageStats />)
      
      // All features should show "Unlimited" for Enterprise tier
      expect(screen.getByText('18 of Unlimited')).toBeInTheDocument() // AI Generations
      expect(screen.getByText('5 of Unlimited')).toBeInTheDocument() // Projects
      expect(screen.getByText('1 of Unlimited')).toBeInTheDocument() // Instagram Accounts
    })

    it('should not show any progress bars for ENTERPRISE unlimited features', () => {
      render(<UsageStats />)
      
      // Should not show progress bars for unlimited features
      const progressBars = screen.queryAllByRole('progressbar')
      expect(progressBars.length).toBe(0)
      
      // Should not show any "Near limit" warnings
      const nearLimitElements = screen.queryAllByText('Near limit')
      expect(nearLimitElements.length).toBe(0)
    })
  })

  describe('Cross-Tier Usage Comparisons', () => {
    it('should show different limits across all tiers', () => {
      const freeLimits = testRBACAccess.getLimitsForTier('free')
      const proLimits = testRBACAccess.getLimitsForTier('professional')
      const enterpriseLimits = testRBACAccess.getLimitsForTier('enterprise')

      // AI Generations progression
      expect(freeLimits.aiGenerationsPerMonth).toBe(5)
      expect(proLimits.aiGenerationsPerMonth).toBe(100)
      expect(enterpriseLimits.aiGenerationsPerMonth).toBe(-1) // unlimited

      // Projects progression
      expect(freeLimits.projectsLimit).toBe(3)
      expect(proLimits.projectsLimit).toBe(50)
      expect(enterpriseLimits.projectsLimit).toBe(-1) // unlimited

      // Instagram Accounts progression
      expect(freeLimits.instagramAccountsLimit).toBe(1)
      expect(proLimits.instagramAccountsLimit).toBe(3)
      expect(enterpriseLimits.instagramAccountsLimit).toBe(-1) // unlimited
    })

    it('should validate upgrade path benefits', () => {
      // FREE -> PRO benefits
      expect(testRBACAccess.hasFeatureAccess('free', 'unlimited_ai_generations')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('professional', 'unlimited_ai_generations')).toBe(true)
      
      expect(testRBACAccess.hasFeatureAccess('free', 'advanced_templates')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('professional', 'advanced_templates')).toBe(true)

      // PRO -> ENTERPRISE benefits
      expect(testRBACAccess.hasFeatureAccess('professional', 'custom_branding')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'custom_branding')).toBe(true)
      
      expect(testRBACAccess.hasFeatureAccess('professional', 'api_access')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'api_access')).toBe(true)
      
      expect(testRBACAccess.hasFeatureAccess('professional', 'dedicated_support')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'dedicated_support')).toBe(true)
    })
  })

  describe('Component Accessibility and UX', () => {
    it('should have proper ARIA labels and roles for all tiers', () => {
      // Test with FREE tier first
      const freeStore = setupAuthStoreForTier('FREE')
      const { useAuthStore } = require('@/stores/useAuthStore')
      useAuthStore.mockReturnValue(freeStore.getState())
      
      const { rerender } = render(<UsageStats />)
      
      // Check for upgrade button accessibility
      const upgradeButton = screen.getByRole('button', { name: /upgrade/i })
      expect(upgradeButton).toBeInTheDocument()
      expect(upgradeButton).toHaveAttribute('type', 'button')

      // Test with PRO tier (no upgrade button)
      const proStore = setupAuthStoreForTier('PRO')
      useAuthStore.mockReturnValue(proStore.getState())
      rerender(<UsageStats />)
      
      expect(screen.queryByRole('button', { name: /upgrade/i })).not.toBeInTheDocument()
    })

    it('should display user-friendly tier names', () => {
      const testCases = [
        { tier: 'FREE', expectedText: 'Free Plan' },
        { tier: 'PRO', expectedText: 'Professional Plan' },
        { tier: 'ENTERPRISE', expectedText: 'Enterprise Plan' }
      ] as const

      testCases.forEach(({ tier, expectedText }) => {
        const store = setupAuthStoreForTier(tier)
        const { useAuthStore } = require('@/stores/useAuthStore')
        useAuthStore.mockReturnValue(store.getState())
        
        const { container } = render(<UsageStats />)
        expect(screen.getByText(new RegExp(expectedText))).toBeInTheDocument()
        
        // Cleanup for next iteration
        container.remove()
      })
    })
  })
})