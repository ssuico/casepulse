"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "manager";
}

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserDeleted: () => void;
  user: User | null;
}

export function DeleteUserModal({ isOpen, onClose, onUserDeleted, user }: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!user) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        onUserDeleted();
        onClose();
      } else {
        setError(data.message || "Failed to delete user");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          <div className="bg-muted p-4 rounded-md space-y-2">
            {(user.firstName || user.lastName) && (
              <p className="text-sm">
                <span className="font-semibold">Name:</span> {user.firstName} {user.lastName}
              </p>
            )}
            <p className="text-sm">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Role:</span>{" "}
              <span className="capitalize">{user.role}</span>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

