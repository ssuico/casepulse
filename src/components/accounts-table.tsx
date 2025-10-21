"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, User, Calendar } from "lucide-react";

interface Account {
  _id: string;
  accountName: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

interface AccountsTableProps {
  accounts: Account[];
  onAccountDeleted: () => void;
}

export function AccountsTable({ accounts, onAccountDeleted }: AccountsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, accountName: string) => {
    if (!confirm(`Are you sure you want to delete "${accountName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete account");
      }

      onAccountDeleted();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 bg-card border rounded-lg">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
        <p className="text-muted-foreground mb-4">
          Add your first Seller Central account to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium">
                Account Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium">
                Username
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium">
                Password
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium">
                2FA Key
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium">
                Created At
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {accounts.map((account) => (
              <tr
                key={account._id}
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{account.accountName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm">{account.username}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted-foreground">
                    ••••••••
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted-foreground">
                    ••••••••
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(account.createdAt)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(account._id, account.accountName)}
                    disabled={deletingId === account._id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === account._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

