import { Loader2 } from "lucide-react"
import React from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export interface LoadingDialogProps {
  open: boolean
  deliveryId: string
}

export const CreateGrnLoadingDialog: React.FC<LoadingDialogProps> = ({ open, deliveryId }) => (
  <Dialog open={open}>
    <DialogContent className="sm:max-w-sm" showCloseButton={false}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <div className="text-center">
          <DialogTitle>Loading Delivery Details...</DialogTitle>
          <p className="mt-2 text-sm text-gray-500">
            Please wait while we fetch your delivery information.
          </p>
          <p className="mt-1 text-xs text-blue-700">Delivery ID: {deliveryId}</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)
