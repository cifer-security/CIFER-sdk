"use client"

import React, { useRef, useEffect } from "react"

/**
 * Shared console output panel used across all demo pages.
 * Displays timestamped log entries with color coding for errors and successes.
 */
export function ConsoleLog({ logs }: { logs: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="glow-card p-6">
      <h3 className="text-sm font-semibold text-white mb-4">
        Console Output
      </h3>
      <div
        ref={scrollRef}
        className="bg-zinc-950 rounded-lg p-4 h-[500px] overflow-auto font-mono text-xs leading-relaxed"
      >
        {logs.length === 0 ? (
          <p className="text-zinc-600">Waiting for action...</p>
        ) : (
          logs.map((entry, i) => (
            <div
              key={i}
              className={`${
                entry.includes("ERROR")
                  ? "text-red-400"
                  : entry.includes("Success") ||
                      entry.includes("ready") ||
                      entry.includes("confirmed") ||
                      entry.includes("Created") ||
                      entry.includes("Verified") ||
                      entry.includes("Encrypted") ||
                      entry.includes("Decrypted") ||
                      entry.includes("Session")
                    ? "text-[#00ff9d]"
                    : "text-zinc-400"
              }`}
            >
              {entry}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
