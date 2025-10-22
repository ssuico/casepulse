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
import { Loader2, AlertTriangle } from "lucide-react";

interface Brand {
  _id: string;
  brandName: string;
}

interface DeleteBrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onConfirmDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export function DeleteBrandModal({
  open,
  onOpenChange,
  brand,
  onConfirmDelete,
  isDeleting,
}: DeleteBrandModalProps) {
  const handleDelete = async () => {
    if (!brand) return;
    await onConfirmDelete(brand._id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Delete Brand</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {brand?.brandName}
            </span>
            ? This action cannot be undone and all associated data will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Brand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

