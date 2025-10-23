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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "manager">("user");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUsername("");
        setPassword("");
        setRole("user");
        onUserAdded();
        onClose();
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setRole("user");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account. Fill in all the required information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                minLength={3}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 3 characters
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "user" | "manager")}
                className="px-3 py-2 border rounded-md text-sm bg-background cursor-pointer"
                required
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Managers have additional privileges
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

