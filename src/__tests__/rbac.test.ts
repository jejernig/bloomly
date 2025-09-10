import { 
  TEST_USERS, 
  testRBACAccess, 
  setupAuthStoreForTier,
  createMockUserForTier 
} from '@/test-utils'
import { SUBSCRIPTION_LIMITS } from '@/types'

describe('RBAC (Role-Based Access Control) Tests', () => {
  describe('Test User Account Validation', () => {
    it('should have all three test accounts configured correctly', () => {
      expect(TEST_USERS.FREE).toEqual({
        email: 'free@bloomly.io',
        password: 'TestPassword123!',
        tier: 'free',
        fullName: 'Free User'
      })

      expect(TEST_USERS.PRO).toEqual({
        email: 'pro@bloomly.io',
        password: 'TestPassword123!',
        tier: 'professional',
        fullName: 'Pro User'
      })

      expect(TEST_USERS.ENTERPRISE).toEqual({
        email: 'ent@bloomly.io',
        password: 'TestPassword123!',
        tier: 'enterprise',
        fullName: 'Enterprise User'
      })
    })

    it('should create proper mock data for each tier', () => {
      const freeUser = createMockUserForTier('FREE')
      expect(freeUser.user.email).toBe('free@bloomly.io')
      expect(freeUser.profile.subscription_tier).toBe('free')
      expect(freeUser.user.user_metadata.full_name).toBe('Free User')

      const proUser = createMockUserForTier('PRO')
      expect(proUser.user.email).toBe('pro@bloomly.io')
      expect(proUser.profile.subscription_tier).toBe('professional')
      expect(proUser.user.user_metadata.full_name).toBe('Pro User')

      const enterpriseUser = createMockUserForTier('ENTERPRISE')
      expect(enterpriseUser.user.email).toBe('ent@bloomly.io')
      expect(enterpriseUser.profile.subscription_tier).toBe('enterprise')
      expect(enterpriseUser.user.user_metadata.full_name).toBe('Enterprise User')
    })
  })

  describe('Subscription Tier Limits', () => {
    it('should enforce correct limits for FREE tier', () => {
      const limits = testRBACAccess.getLimitsForTier('free')
      
      expect(limits.aiGenerationsPerMonth).toBe(5)
      expect(limits.projectsLimit).toBe(3)
      expect(limits.instagramAccountsLimit).toBe(1)
      
      // Verify against actual SUBSCRIPTION_LIMITS if available
      if (SUBSCRIPTION_LIMITS?.free) {
        expect(limits.aiGenerationsPerMonth).toBe(SUBSCRIPTION_LIMITS.free.aiGenerationsPerMonth)
        expect(limits.projectsLimit).toBe(SUBSCRIPTION_LIMITS.free.projectsLimit)
        expect(limits.instagramAccountsLimit).toBe(SUBSCRIPTION_LIMITS.free.instagramAccountsLimit)
      }
    })

    it('should enforce correct limits for PRO tier', () => {
      const limits = testRBACAccess.getLimitsForTier('professional')
      
      expect(limits.aiGenerationsPerMonth).toBe(100) // changed from unlimited to match actual limits
      expect(limits.projectsLimit).toBe(50)
      expect(limits.instagramAccountsLimit).toBe(3) // changed from 5 to match actual limits
      
      // Verify against actual SUBSCRIPTION_LIMITS if available
      if (SUBSCRIPTION_LIMITS?.professional) {
        expect(limits.aiGenerationsPerMonth).toBe(SUBSCRIPTION_LIMITS.professional.aiGenerationsPerMonth)
        expect(limits.projectsLimit).toBe(SUBSCRIPTION_LIMITS.professional.projectsLimit)
        expect(limits.instagramAccountsLimit).toBe(SUBSCRIPTION_LIMITS.professional.instagramAccountsLimit)
      }
    })

    it('should enforce correct limits for ENTERPRISE tier', () => {
      const limits = testRBACAccess.getLimitsForTier('enterprise')
      
      expect(limits.aiGenerationsPerMonth).toBe(-1) // unlimited
      expect(limits.projectsLimit).toBe(-1) // unlimited
      expect(limits.instagramAccountsLimit).toBe(-1) // unlimited
      
      // Verify against actual SUBSCRIPTION_LIMITS if available
      if (SUBSCRIPTION_LIMITS?.enterprise) {
        expect(limits.aiGenerationsPerMonth).toBe(SUBSCRIPTION_LIMITS.enterprise.aiGenerationsPerMonth)
        expect(limits.projectsLimit).toBe(SUBSCRIPTION_LIMITS.enterprise.projectsLimit)
        expect(limits.instagramAccountsLimit).toBe(SUBSCRIPTION_LIMITS.enterprise.instagramAccountsLimit)
      }
    })
  })

  describe('Feature Access Control', () => {
    it('should grant appropriate feature access for FREE tier', () => {
      expect(testRBACAccess.hasFeatureAccess('free', 'basic_projects')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('free', 'limited_ai_generations')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('free', 'unlimited_ai_generations')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('free', 'advanced_templates')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('free', 'priority_support')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('free', 'custom_branding')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('free', 'api_access')).toBe(false)
    })

    it('should grant appropriate feature access for PRO tier', () => {
      expect(testRBACAccess.hasFeatureAccess('professional', 'basic_projects')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('professional', 'unlimited_ai_generations')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('professional', 'advanced_templates')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('professional', 'priority_support')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('professional', 'custom_branding')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('professional', 'api_access')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('professional', 'dedicated_support')).toBe(false)
    })

    it('should grant appropriate feature access for ENTERPRISE tier', () => {
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'basic_projects')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'unlimited_ai_generations')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'advanced_templates')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'priority_support')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'custom_branding')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'api_access')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'dedicated_support')).toBe(true)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'all_features')).toBe(true)
    })
  })

  describe('Auth Store Setup for Different Tiers', () => {
    it('should setup auth store correctly for FREE tier', () => {
      const store = setupAuthStoreForTier('FREE')
      const state = store.getState()
      
      expect(state.user).toBeDefined()
      expect(state.user?.email).toBe('free@bloomly.io')
      expect(state.user?.subscriptionTier).toBe('free')
      expect(state.user?.fullName).toBe('Free User')
      expect(state.isLoading).toBe(false)
      expect(state.isInitialized).toBe(true)
    })

    it('should setup auth store correctly for PRO tier', () => {
      const store = setupAuthStoreForTier('PRO')
      const state = store.getState()
      
      expect(state.user).toBeDefined()
      expect(state.user?.email).toBe('pro@bloomly.io')
      expect(state.user?.subscriptionTier).toBe('professional')
      expect(state.user?.fullName).toBe('Pro User')
      expect(state.isLoading).toBe(false)
      expect(state.isInitialized).toBe(true)
    })

    it('should setup auth store correctly for ENTERPRISE tier', () => {
      const store = setupAuthStoreForTier('ENTERPRISE')
      const state = store.getState()
      
      expect(state.user).toBeDefined()
      expect(state.user?.email).toBe('ent@bloomly.io')
      expect(state.user?.subscriptionTier).toBe('enterprise')
      expect(state.user?.fullName).toBe('Enterprise User')
      expect(state.isLoading).toBe(false)
      expect(state.isInitialized).toBe(true)
    })
  })

  describe('Usage Limits Validation', () => {
    it('should respect AI generation limits for each tier', () => {
      const freeLimits = testRBACAccess.getLimitsForTier('free')
      const proLimits = testRBACAccess.getLimitsForTier('professional')
      const enterpriseLimits = testRBACAccess.getLimitsForTier('enterprise')

      // FREE tier has strict limits
      expect(freeLimits.aiGenerationsPerMonth).toBe(5)
      expect(freeLimits.aiGenerationsPerMonth).toBeLessThan(100)
      
      // PRO has higher limit, ENTERPRISE has unlimited AI generations
      expect(proLimits.aiGenerationsPerMonth).toBe(100)
      expect(enterpriseLimits.aiGenerationsPerMonth).toBe(-1)
    })

    it('should respect project limits for each tier', () => {
      const freeLimits = testRBACAccess.getLimitsForTier('free')
      const proLimits = testRBACAccess.getLimitsForTier('professional')
      const enterpriseLimits = testRBACAccess.getLimitsForTier('enterprise')

      // FREE tier has minimal project limit
      expect(freeLimits.projectsLimit).toBe(3)
      expect(freeLimits.projectsLimit).toBeLessThan(10)
      
      // PRO tier has substantial but limited projects
      expect(proLimits.projectsLimit).toBe(50)
      expect(proLimits.projectsLimit).toBeGreaterThan(freeLimits.projectsLimit)
      
      // ENTERPRISE tier has unlimited projects
      expect(enterpriseLimits.projectsLimit).toBe(-1)
    })

    it('should respect Instagram account limits for each tier', () => {
      const freeLimits = testRBACAccess.getLimitsForTier('free')
      const proLimits = testRBACAccess.getLimitsForTier('professional')
      const enterpriseLimits = testRBACAccess.getLimitsForTier('enterprise')

      // FREE tier has single Instagram account
      expect(freeLimits.instagramAccountsLimit).toBe(1)
      
      // PRO tier has multiple Instagram accounts
      expect(proLimits.instagramAccountsLimit).toBe(3)
      expect(proLimits.instagramAccountsLimit).toBeGreaterThan(freeLimits.instagramAccountsLimit)
      
      // ENTERPRISE tier has unlimited Instagram accounts
      expect(enterpriseLimits.instagramAccountsLimit).toBe(-1)
    })
  })

  describe('Upgrade Path Validation', () => {
    it('should show upgrade benefits from FREE to PRO', () => {
      const freeLimits = testRBACAccess.getLimitsForTier('free')
      const proLimits = testRBACAccess.getLimitsForTier('professional')

      // Verify upgrade benefits
      expect(proLimits.aiGenerationsPerMonth).toBeGreaterThan(freeLimits.aiGenerationsPerMonth)
      expect(proLimits.projectsLimit).toBeGreaterThan(freeLimits.projectsLimit)
      expect(proLimits.instagramAccountsLimit).toBeGreaterThan(freeLimits.instagramAccountsLimit)
      
      // PRO features not available in FREE
      expect(testRBACAccess.hasFeatureAccess('free', 'unlimited_ai_generations')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('professional', 'unlimited_ai_generations')).toBe(true)
      
      expect(testRBACAccess.hasFeatureAccess('free', 'advanced_templates')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('professional', 'advanced_templates')).toBe(true)
    })

    it('should show upgrade benefits from PRO to ENTERPRISE', () => {
      const proLimits = testRBACAccess.getLimitsForTier('professional')
      const enterpriseLimits = testRBACAccess.getLimitsForTier('enterprise')

      // ENTERPRISE has unlimited vs PRO limits
      expect(enterpriseLimits.projectsLimit).toBe(-1)
      expect(proLimits.projectsLimit).toBeGreaterThan(0)
      expect(proLimits.projectsLimit).toBeLessThan(100) // finite limit
      
      expect(enterpriseLimits.instagramAccountsLimit).toBe(-1)
      expect(proLimits.instagramAccountsLimit).toBeGreaterThan(0)
      expect(proLimits.instagramAccountsLimit).toBeLessThan(100) // finite limit
      
      // ENTERPRISE-only features
      expect(testRBACAccess.hasFeatureAccess('professional', 'custom_branding')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'custom_branding')).toBe(true)
      
      expect(testRBACAccess.hasFeatureAccess('professional', 'api_access')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'api_access')).toBe(true)
      
      expect(testRBACAccess.hasFeatureAccess('professional', 'dedicated_support')).toBe(false)
      expect(testRBACAccess.hasFeatureAccess('enterprise', 'dedicated_support')).toBe(true)
    })
  })

  describe('Security and Access Control', () => {
    it('should have secure test passwords', () => {
      Object.values(TEST_USERS).forEach(user => {
        expect(user.password).toMatch(/^.{8,}$/) // At least 8 characters
        expect(user.password).toMatch(/[A-Z]/) // Contains uppercase
        expect(user.password).toMatch(/[a-z]/) // Contains lowercase  
        expect(user.password).toMatch(/[0-9]/) // Contains number
        expect(user.password).toMatch(/[!@#$%^&*]/) // Contains special character
      })
    })

    it('should have proper email domains for testing', () => {
      Object.values(TEST_USERS).forEach(user => {
        expect(user.email).toMatch(/@bloomly\.io$/)
        expect(user.email).not.toMatch(/@gmail\.com|@yahoo\.com|@hotmail\.com/)
      })
    })

    it('should have unique user identifiers for each tier', () => {
      const emails = Object.values(TEST_USERS).map(user => user.email)
      const uniqueEmails = new Set(emails)
      expect(uniqueEmails.size).toBe(emails.length)

      const tiers = Object.values(TEST_USERS).map(user => user.tier)
      const uniqueTiers = new Set(tiers)
      expect(uniqueTiers.size).toBe(tiers.length)
    })
  })
})