"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface Account {
  _id: string;
  accountName: string;
  username: string;
}

interface EditAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountUpdated: () => void;
  account: Account | null;
}

export function EditAccountModal({
  open,
  onOpenChange,
  onAccountUpdated,
  account,
}: EditAccountModalProps) {
  const [formData, setFormData] = useState({
    accountName: "",
    username: "",
    password: "",
    twoFAKey: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FAKey, setShow2FAKey] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        accountName: account.accountName,
        username: account.username,
        password: "",
        twoFAKey: "",
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const updateData: {
        accountName: string;
        username: string;
        password?: string;
        twoFAKey?: string;
      } = {
        accountName: formData.accountName,
        username: formData.username,
      };

      // Only include password if it's not empty
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      // Only include 2FA key if it's not empty
      if (formData.twoFAKey.trim()) {
        updateData.twoFAKey = formData.twoFAKey;
      }

      const response = await fetch(`/api/accounts/${account._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update account");
      }

      // Close modal and refresh accounts
      onOpenChange(false);
      onAccountUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Seller Central Account</DialogTitle>
          <DialogDescription>
            Update account details. Leave password and 2FA key empty to keep current values.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name *</Label>
              <Input
                id="accountName"
                name="accountName"
                placeholder="e.g., REFRIGIWEAR US"
                value={formData.accountName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Seller Central Username *</Label>
              <Input
                id="username"
                name="username"
                type="email"
                placeholder="seller@example.com"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Seller Central Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Leave empty to keep current"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Only fill this if you want to change the password
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twoFAKey">Seller Central 2FA Key</Label>
              <div className="relative">
                <Input
                  id="twoFAKey"
                  name="twoFAKey"
                  type={show2FAKey ? "text" : "password"}
                  placeholder="Leave empty to keep current"
                  value={formData.twoFAKey}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow2FAKey(!show2FAKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {show2FAKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Only fill this if you want to change the 2FA key
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

