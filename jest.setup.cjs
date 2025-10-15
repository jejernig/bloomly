require('@testing-library/jest-dom')

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});


// Mock crypto.randomUUID for components that use it
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mocked-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        in: jest.fn(() => Promise.resolve({ data: [], error: null })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: null })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { 
                id: '12345-67890-abcdef',
                email: 'test@example.com', 
                full_name: 'Updated User',
                subscription_tier: 'free',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              }, 
              error: null 
            })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    functions: {
      invoke: jest.fn(),
    },
  },
}));

// Mock environment variables for tests
process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://amvpmljsregjrmhwcfkt.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtdnBtbGpzcmVnanJtaHdjZmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTIyMDAsImV4cCI6MjA3MzA4ODIwMH0.9WYNwJQZjFOmRGZ8-k2azHLs8QhMeoJCxLbvqs0uB_w',
};

// Mock localStorage for Zustand persist with actual storage functionality
const localStorageData = new Map();
const localStorageMock = {
  getItem: jest.fn((key) => localStorageData.get(key) || null),
  setItem: jest.fn((key, value) => localStorageData.set(key, value)),
  removeItem: jest.fn((key) => {
    localStorageData.delete(key);
    return null;
  }),
  clear: jest.fn(() => localStorageData.clear()),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock fetch globally for tests with specific endpoint handling
global.fetch = jest.fn((url, options) => {
  // Handle different Supabase endpoints based on the URL
  if (typeof url === 'string') {
    // Sign in endpoint
    if (url.includes('/auth/v1/token?grant_type=password')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            access_token: 'fake-access-token',
            refresh_token: 'fake-refresh-token',
            user: {
              id: '12345-67890-abcdef',
              email: 'test@example.com',
              user_metadata: { full_name: 'Test User' },
            },
          }),
      });
    }
    
    // Sign up endpoint
    if (url.includes('/auth/v1/signup')) {
      const body = JSON.parse(options?.body || '{}');
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: '12345-67890-abcdef',
            email: body.email || 'test@example.com',
            email_confirmed_at: null,
          }),
      });
    }
    
    // Google OAuth endpoint
    if (url.includes('/auth/v1/authorize?provider=google')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve('OAuth redirect'),
      });
    }
    
    // User session validation endpoint
    if (url.includes('/auth/v1/user')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: '12345-67890-abcdef',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' },
          }),
      });
    }
  }
  
  // Default response for other fetch calls
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        user: {
          id: '12345-67890-abcdef',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' },
        },
      }),
  });
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageData.clear(); // Clear the actual data store
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  global.fetch.mockClear();
});

// Increase timeout for async tests
jest.setTimeout(10000);