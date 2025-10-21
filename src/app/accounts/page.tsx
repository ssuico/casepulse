"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AddAccountModal } from "@/components/add-account-modal";
import { AccountsTable } from "@/components/accounts-table";
import { User, RefreshCw, Plus } from "lucide-react";

interface Account {
  _id: string;
  accountName: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export default function AccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  // Fetch accounts
  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const response = await fetch("/api/accounts");
      const data = await response.json();
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8" />
              Seller Central Accounts
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your Amazon Seller Central account credentials securely. All passwords and 2FA keys are encrypted.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchAccounts}
              disabled={isLoadingAccounts}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAccounts ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold">{accounts.length}</p>
              </div>
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{accounts.length}</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {accounts.length > 0 
                    ? new Date(Math.max(...accounts.map(a => new Date(a.updatedAt).getTime()))).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      {isLoadingAccounts ? (
        <div className="bg-card border rounded-lg p-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      ) : (
        <AccountsTable accounts={accounts} onAccountDeleted={fetchAccounts} />
      )}

      {/* Add Account Modal */}
      <AddAccountModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAccountAdded={fetchAccounts}
      />
    </div>
  );
}

