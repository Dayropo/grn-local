import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface ErrorDialogProps {
  open: boolean
  error: string | null
  onRetry: () => void
  onNewSearch: () => void
  onClose: () => void
}

export const CreateGrnErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  error,
  onRetry,
  onNewSearch,
  onClose,
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <DialogTitle>Unable to Load Data</DialogTitle>
        </div>
        <DialogDescription asChild>
          <div className="mt-2 space-y-4">
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div className="flex gap-2">
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={onNewSearch} variant="outline" className="flex-1">
                New Search
              </Button>
            </div>
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
)
