"use client"

import { SHORTCUTS } from "@/hooks/use-keyboard-shortcuts"

interface KeyboardShortcutsDialogProps {
  open: boolean
  onClose: () => void
}

export function KeyboardShortcutsDialog({ open, onClose }: KeyboardShortcutsDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="space-y-6">
          {SHORTCUTS.map(group => (
            <div key={group.category}>
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">{group.category}</h3>
              <div className="space-y-2">
                {group.shortcuts.map(s => (
                  <div key={s.description} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((key, i) => (
                        <span key={i} className="bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded border border-slate-600 font-mono">
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-xs mt-6 text-center">Press <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">?</kbd> to toggle this dialog</p>
      </div>
    </div>
  )
}
