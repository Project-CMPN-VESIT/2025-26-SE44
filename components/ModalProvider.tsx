'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ICONS } from '@/lib/constants'

type ModalType = 'info' | 'confirm' | 'success' | 'warning' | 'danger'

interface ModalOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: ModalType
}

interface ModalContextType {
  showAlert: (options: ModalOptions) => Promise<void>
  showConfirm: (options: ModalOptions) => Promise<boolean>
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) throw new Error('useModal must be used within a ModalProvider')
  return context
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ModalOptions | null>(null)
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const showAlert = (opts: ModalOptions): Promise<void> => {
    setOptions({ ...opts, type: opts.type || 'info', confirmText: opts.confirmText || 'OK' })
    setIsOpen(true)
    return new Promise((resolve) => {
      setResolver(() => () => {
        setIsOpen(false)
        resolve()
      })
    })
  }

  const showConfirm = (opts: ModalOptions): Promise<boolean> => {
    setOptions({ ...opts, type: opts.type || 'confirm', confirmText: opts.confirmText || 'Confirm', cancelText: opts.cancelText || 'Cancel' })
    setIsOpen(true)
    return new Promise((resolve) => {
      setResolver(() => (value: boolean) => {
        setIsOpen(false)
        resolve(value)
      })
    })
  }

  const handleConfirm = () => resolver?.(true)
  const handleCancel = () => resolver?.(false)

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {isOpen && options && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal" style={{ maxWidth: 420, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '32px 32px 24px', textAlign: 'center' }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                background: options.type === 'danger' ? '#fde8e8' : options.type === 'warning' ? '#fef3cd' : options.type === 'success' ? '#e4f2eb' : 'var(--primary-pale)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: options.type === 'danger' ? '#c0392b' : options.type === 'warning' ? '#856404' : options.type === 'success' ? '#2d7a50' : 'var(--primary)'
              }}>
                <svg viewBox="0 0 24 24" style={{ width: 32, height: 32, fill: 'currentColor' }}>
                   {options.type === 'danger' && <path d={ICONS.trash || "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"} />}
                   {options.type === 'warning' && <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />}
                   {options.type === 'success' && <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />}
                   {(options.type === 'info' || options.type === 'confirm') && <path d={ICONS.heart || "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"} />}
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
                {options.title || (options.type === 'confirm' ? 'Are you sure?' : 'Notice')}
              </h3>
              <p style={{ fontSize: '.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {options.message}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: options.cancelText ? '1fr 1fr' : '1fr', borderTop: '1px solid var(--border)' }}>
              {options.cancelText && (
                <button 
                  onClick={handleCancel}
                  style={{ 
                    padding: 18, 
                    background: 'none', 
                    border: 'none', 
                    borderRight: '1px solid var(--border)',
                    fontSize: '.9rem', 
                    fontWeight: 700, 
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {options.cancelText}
                </button>
              )}
              <button 
                onClick={handleConfirm}
                style={{ 
                  padding: 18, 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '.9rem', 
                  fontWeight: 800, 
                  color: options.type === 'danger' ? '#c0392b' : 'var(--primary)',
                  cursor: 'pointer'
                }}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}
