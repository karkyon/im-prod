"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { SearchSidebar } from "@/components/layout/SearchSidebar";
import { MainViewport } from "@/components/layout/MainViewport";

export default function PartsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <SearchSidebar />
        <MainViewport />
      </div>
    </div>
  );
}
