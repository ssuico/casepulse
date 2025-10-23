"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
}: AlertModalProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case "info":
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50";
      case "error":
        return "bg-red-50";
      case "warning":
        return "bg-yellow-50";
      case "info":
      default:
        return "bg-blue-50";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getBgColor()}`}>
              {getIcon()}
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="text-base pt-2 whitespace-pre-line">
          {message}
        </DialogDescription>
        <DialogFooter className="gap-2 sm:gap-0">
          {onConfirm && (
            <Button type="button" variant="outline" onClick={onClose}>
              {cancelText}
            </Button>
          )}
          <Button type="button" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

