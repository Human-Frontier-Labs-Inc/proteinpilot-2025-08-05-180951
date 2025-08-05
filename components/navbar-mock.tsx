"use client";

import MobileSidebar from "./mobile-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NavbarMock() {
  // Mock data for testing
  const apiLimitCount = 0;
  const isPro = false;

  return (
    <div className="flex items-center p-4">
      <MobileSidebar isPro={isPro} apiLimitCount={apiLimitCount} />

      <div className="flex w-full justify-end">
        {/* Mock user avatar instead of UserButton */}
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src="/placeholder-avatar.png" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}