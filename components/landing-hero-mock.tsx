"use client";

import TypewriterComponent from "typewriter-effect";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const LandingHeroMock = () => {
  // Always act as if not signed in for testing
  const isSignedIn = false;

  return (
    <div className="text-white font-bold py-36 text-center space-y-5">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-5 font-extrabold">
        <h1>Track Your Protein Like a Pro</h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-600">
          <TypewriterComponent
            options={{
              strings: [
                "AI-Powered Tracking.",
                "Smart Food Recognition.",
                "Personalized Goals.",
                "Progress Analytics.",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </div>
      </div>
      <div className="text-sm md:text-xl font-light text-zinc-400">
        Reach your fitness goals with intelligent protein tracking.
      </div>
      <div>
        <Link href="/dashboard">
          <Button
            variant="premium"
            className="md:text-lg p-4 md:p-6 rounded-full font-semibold"
          >
            Start Testing Without Auth
          </Button>
        </Link>
      </div>
      <div className="text-zinc-400 text-xs md:text-sm font-normal">
        No authentication required for testing.
      </div>
    </div>
  );
};