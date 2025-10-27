"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";

interface Account {
  _id: string;
  accountName: string;
}

interface AddBrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBrandAdded: () => void;
  accounts: Account[];
}

export function AddBrandModal({
  open,
  onOpenChange,
  onBrandAdded,
  accounts,
}: AddBrandModalProps) {
  const [formData, setFormData] = useState({
    brandName: "",
    sellerCentralAccountId: "",
    brandUrl: "",
    marketplace: "US",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create brand");
      }

      // Reset form
      setFormData({
        brandName: "",
        sellerCentralAccountId: "",
        brandUrl: "",
        marketplace: "US",
      });

      // Close modal and refresh brands
      onOpenChange(false);
      onBrandAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Brand</DialogTitle>
          <DialogDescription>
            Add a new brand and associate it with a Seller Central account.
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
              <Label htmlFor="brandName">Brand Name *</Label>
              <Input
                id="brandName"
                name="brandName"
                placeholder="e.g., REFRIGIWEAR"
                value={formData.brandName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellerCentralAccountId">Seller Central Account *</Label>
              <select
                id="sellerCentralAccountId"
                name="sellerCentralAccountId"
                value={formData.sellerCentralAccountId}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.accountName}
                  </option>
                ))}
              </select>
              {accounts.length === 0 && (
                <p className="text-xs text-amber-600">
                  No accounts available. Please add a Seller Central account first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketplace">Marketplace *</Label>
              <select
                id="marketplace"
                name="marketplace"
                value={formData.marketplace}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="US">US</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">Mexico</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandUrl">Brand URL *</Label>
              <Input
                id="brandUrl"
                name="brandUrl"
                type="url"
                placeholder="https://www.amazon.com/stores/page/..."
                value={formData.brandUrl}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                The URL to the brand's Amazon storefront or product page
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
            <Button type="submit" disabled={isLoading || accounts.length === 0}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Brand
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

