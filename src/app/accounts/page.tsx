"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AddAccountModal } from "@/components/add-account-modal";
import { AccountsTable } from "@/components/accounts-table";
import { AddBrandModal } from "@/components/add-brand-modal";
import { BrandsTable } from "@/components/brands-table";
import { User, RefreshCw, Plus, Tag } from "lucide-react";

interface Account {
  _id: string;
  accountName: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

interface Brand {
  _id: string;
  brandName: string;
  sellerCentralAccountId: {
    _id: string;
    accountName: string;
  };
  brandUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function AccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);

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

  // Fetch brands
  const fetchBrands = async () => {
    setIsLoadingBrands(true);
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchBrands();
  }, []);

  return (
    <div>
      {/* Seller Central Accounts Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-7 w-7" />
            Seller Central Accounts
          </h2>
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
          {/* Total Accounts Card */}
          <div className="relative bg-[#4b7bec] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">
              <User className="h-16 w-16 text-white" />
            </div>
            <div className="relative text-right">
              <p className="text-4xl font-bold text-white mb-1">{accounts.length}</p>
              <p className="text-sm text-white/80 font-medium">Total Accounts</p>
            </div>
          </div>

          {/* Active Accounts Card */}
          <div className="relative bg-[#4b7bec] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">
              <User className="h-16 w-16 text-white" />
            </div>
            <div className="relative text-right">
              <p className="text-4xl font-bold text-white mb-1">{accounts.length}</p>
              <p className="text-sm text-white/80 font-medium">Active Accounts</p>
            </div>
          </div>

          {/* Last Updated Card */}
          <div className="relative bg-[#4b7bec] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">
              <RefreshCw className="h-16 w-16 text-white" />
            </div>
            <div className="relative text-right">
              <p className="text-xl font-bold text-white mb-1">
                {accounts.length > 0 
                  ? new Date(Math.max(...accounts.map(a => new Date(a.updatedAt).getTime()))).toLocaleDateString()
                  : 'N/A'
                }
              </p>
              <p className="text-sm text-white/80 font-medium">Last Updated</p>
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
      </div>

      {/* Brands Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="h-7 w-7" />
            Brands
          </h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchBrands}
              disabled={isLoadingBrands}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingBrands ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsBrandModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </div>
        </div>

        {/* Brands Table */}
        {isLoadingBrands ? (
          <div className="bg-card border rounded-lg p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Loading brands...</p>
          </div>
        ) : (
          <BrandsTable brands={brands} onBrandDeleted={fetchBrands} accounts={accounts} />
        )}
      </div>

      {/* Add Account Modal */}
      <AddAccountModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAccountAdded={fetchAccounts}
      />

      {/* Add Brand Modal */}
      <AddBrandModal
        open={isBrandModalOpen}
        onOpenChange={setIsBrandModalOpen}
        onBrandAdded={fetchBrands}
        accounts={accounts}
      />
    </div>
  );
}




