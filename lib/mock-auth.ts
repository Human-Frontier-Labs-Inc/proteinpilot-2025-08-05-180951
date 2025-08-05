// Mock authentication system for testing - follows Clerk patterns
export const MOCK_USER = {
  id: "user_mock_123456789",
  firstName: "John",
  lastName: "Doe",
  emailAddresses: [{ emailAddress: "john.doe@example.com" }],
  imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_SESSION = {
  id: "sess_mock_123456789",
  userId: MOCK_USER.id,
  status: "active",
  lastActiveAt: new Date().toISOString(),
  expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
};

// Mock auth function that mimics Clerk's auth()
export function mockAuth() {
  // In testing mode, always return mock user
  if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AUTH === 'true') {
    return {
      userId: MOCK_USER.id,
      sessionId: MOCK_SESSION.id,
      user: MOCK_USER,
      session: MOCK_SESSION,
    };
  }
  
  // In production, this would fall back to real Clerk auth
  try {
    const { auth } = require("@clerk/nextjs/server");
    return auth();
  } catch (error) {
    // If Clerk is not configured, use mock for development
    console.warn("Clerk not configured, using mock auth for development");
    return {
      userId: MOCK_USER.id,
      sessionId: MOCK_SESSION.id,
      user: MOCK_USER,
      session: MOCK_SESSION,
    };
  }
}

// Mock currentUser function
export function mockCurrentUser() {
  if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AUTH === 'true') {
    return Promise.resolve(MOCK_USER);
  }
  
  try {
    const { currentUser } = require("@clerk/nextjs/server");
    return currentUser();
  } catch (error) {
    console.warn("Clerk not configured, using mock user for development");
    return Promise.resolve(MOCK_USER);
  }
}

// Client-side mock hook
export function useMockUser() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    return {
      isLoaded: true,
      isSignedIn: true,
      user: MOCK_USER,
    };
  }
  
  try {
    const { useUser } = require("@clerk/nextjs");
    return useUser();
  } catch (error) {
    console.warn("Clerk not configured, using mock user hook");
    return {
      isLoaded: true,
      isSignedIn: true, 
      user: MOCK_USER,
    };
  }
}