"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Download, 
  FileText, 
  FileJson, 
  FileCode, 
  ChevronDown,
  Check,
  Loader2
} from "lucide-react"

export interface ExportFormat {
  id: 'pdf' | 'json' | 'txt'
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  extension: string
}

interface ExportButtonProps {
  onExport: (format: 'pdf' | 'json' | 'txt') => Promise<void>
  formats?: ExportFormat[]
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const defaultFormats: ExportFormat[] = [
  {
    id: 'pdf',
    label: 'PDF Document',
    icon: FileText,
    description: 'Professional formatted report',
    extension: '.pdf'
  },
  {
    id: 'json',
    label: 'JSON Data',
    icon: FileJson,
    description: 'Structured data format',
    extension: '.json'
  },
  {
    id: 'txt',
    label: 'Plain Text',
    icon: FileCode,
    description: 'Simple text format',
    extension: '.txt'
  }
]

export default function ExportButton({
  onExport,
  formats = defaultFormats,
  className = "",
  variant = "default",
  size = "md",
  disabled = false
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

  const handleExport = async (format: 'pdf' | 'json' | 'txt') => {
    try {
      setExporting(format)
      await onExport(format)
      setIsOpen(false)
    } catch (error) {
      console.error(`Export failed for ${format}:`, error)
    } finally {
      setExporting(null)
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-8 px-3 text-sm'
      case 'lg': return 'h-12 px-6 text-lg'
      default: return 'h-10 px-4 text-base'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4'
      case 'lg': return 'h-6 w-6'
      default: return 'h-5 w-5'
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant={variant}
        size={size}
        disabled={disabled}
        className={`gap-2 ${className}`}
      >
        <Download className={getIconSize()} />
        Export
        <ChevronDown 
          className={`${getIconSize()} transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-2 z-50"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <Card className="minimal-card shadow-2xl border border-border min-w-64">
              <CardContent className="p-2">
                <div className="space-y-1">
                  {formats.map((format) => (
                    <motion.button
                      key={format.id}
                      onClick={() => handleExport(format.id)}
                      disabled={exporting === format.id}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200
                        hover:bg-muted/50 hover:scale-[1.02] active:scale-[0.98]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${exporting === format.id ? 'bg-primary/10' : ''}
                      `}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-shrink-0">
                        {exporting === format.id ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <format.icon className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">
                          {format.label}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {format.description}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {exporting === format.id ? (
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">
                            {format.extension}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Specialized export buttons for different analysis types
export function ResumeExportButton({ 
  onExport, 
  className = "" 
}: { 
  onExport: (format: 'pdf' | 'json' | 'txt') => Promise<void>
  className?: string 
}) {
  return (
    <ExportButton
      onExport={onExport}
      formats={[
        {
          id: 'pdf',
          label: 'PDF Report',
          icon: FileText,
          description: 'Professional resume analysis report',
          extension: '.pdf'
        },
        {
          id: 'json',
          label: 'JSON Data',
          icon: FileJson,
          description: 'Structured analysis data',
          extension: '.json'
        },
        {
          id: 'txt',
          label: 'Text Summary',
          icon: FileCode,
          description: 'Simple text summary',
          extension: '.txt'
        }
      ]}
      className={className}
    />
  )
}

export function JobExportButton({ 
  onExport, 
  className = "" 
}: { 
  onExport: (format: 'pdf' | 'json' | 'txt') => Promise<void>
  className?: string 
}) {
  return (
    <ExportButton
      onExport={onExport}
      formats={[
        {
          id: 'pdf',
          label: 'PDF Report',
          icon: FileText,
          description: 'Professional job analysis report',
          extension: '.pdf'
        },
        {
          id: 'json',
          label: 'JSON Data',
          icon: FileJson,
          description: 'Structured job data',
          extension: '.json'
        },
        {
          id: 'txt',
          label: 'Text Summary',
          icon: FileCode,
          description: 'Simple text summary',
          extension: '.txt'
        }
      ]}
      className={className}
    />
  )
}

export function SpeechExportButton({ 
  onExport, 
  className = "" 
}: { 
  onExport: (format: 'pdf' | 'json' | 'txt') => Promise<void>
  className?: string 
}) {
  return (
    <ExportButton
      onExport={onExport}
      formats={[
        {
          id: 'pdf',
          label: 'PDF Report',
          icon: FileText,
          description: 'Professional speech analysis report',
          extension: '.pdf'
        },
        {
          id: 'json',
          label: 'JSON Data',
          icon: FileJson,
          description: 'Structured speech data',
          extension: '.json'
        },
        {
          id: 'txt',
          label: 'Text Summary',
          icon: FileCode,
          description: 'Simple text summary',
          extension: '.txt'
        }
      ]}
      className={className}
    />
  )
}
