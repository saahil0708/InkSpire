import React from "react";
import Link from 'next/link';

export default function App() {
  return (
    <React.Fragment>
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
        <h1 className="text-5xl font-bold mb-8 text-cyan-400 font-['Azonix']">Tournament Manager</h1>
        <div className="flex gap-4">
          <Link href="/admin" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-colors">
            Admin Dashboard
          </Link>
          <Link href="/leaderboard" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-lg font-semibold transition-colors">
            Live Leaderboard
          </Link>
        </div>
      </div>
    </React.Fragment>
  )
}