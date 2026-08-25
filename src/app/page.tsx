'use client';

import dynamic from 'next/dynamic';
import { OfficeSidebar } from '@/components/ui/OfficeSidebar';
import { useHermesSocket } from '@/hooks/useHermesSocket';

// Load 3D Canvas dynamically to avoid SSR window/WebGL issues
const OfficeScene = dynamic(
  () => import('@/components/canvas/OfficeScene').then((mod) => mod.OfficeScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-400 font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing 3D Office Environment...</span>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  useHermesSocket();

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-950 select-none">
      <OfficeSidebar />
      <div className="flex-1 h-full relative">
        <OfficeScene />
      </div>
    </main>
  );
}
