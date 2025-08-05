"use client";

import React from "react";

// Mock ClerkProvider that doesn't require authentication
export function ClerkProviderMock({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}