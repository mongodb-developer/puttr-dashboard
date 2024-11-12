'use client';

import { useRef } from 'react';
import AudioPlayer from '../components/AudioPlayer';
import ChartDashboard from '../components/ChartDashboard';

export default function Home() {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <main className="min-h-screen flex flex-col">
      <div ref={chartRef} className="flex-1 p-4">
        <ChartDashboard />
      </div>
    </main>
  );
}
