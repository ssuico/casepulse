"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, User, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Store } from "lucide-react";
import { EditAccountModal } from "@/components/edit-account-modal";
import { DeleteAccountModal } from "@/components/delete-account-modal";
import { AlertModal } from "@/components/alert-modal";

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

type SortField = 'accountName' | 'username' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function AccountsTable({ accounts, onAccountDeleted }: AccountsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Alert modal state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
  });

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal({ ...alertModal, isOpen: false });
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (account: Account) => {
    setDeletingAccount(account);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    setDeletingId(id);

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete account");
      }

      setIsDeleteModalOpen(false);
      onAccountDeleted();
    } catch (err: unknown) {
      showAlert(
        "Delete Failed",
        err instanceof Error ? err.message : "Failed to delete account",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const sortedAccounts = useMemo(() => {
    const sorted = [...accounts].sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];

      if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return sorted;
  }, [accounts, sortField, sortOrder]);

  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedAccounts.slice(startIndex, startIndex + pageSize);
  }, [sortedAccounts, currentPage, pageSize]);

  const totalPages = Math.ceil(accounts.length / pageSize);

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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 inline" />
      : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  if (accounts.length === 0) {
    return (
      <div className="relative text-center py-16 bg-gradient-to-br from-card via-card to-primary/5 border rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-50" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
            <Store className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">No accounts yet</h3>
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            Add your first Seller Central account to get started with monitoring.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-card via-card to-primary/[0.02] border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-muted/50 via-muted/40 to-muted/50 border-b border-border/50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/60 transition-all duration-200 group"
                onClick={() => handleSort('accountName')}
              >
                <div className="flex items-center gap-1">
                  <span>Account Name</span>
                  <SortIcon field="accountName" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/60 transition-all duration-200 group"
                onClick={() => handleSort('username')}
              >
                <div className="flex items-center gap-1">
                  <span>Username</span>
                  <SortIcon field="username" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Password
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                2FA Key
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/60 transition-all duration-200 group"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  <span>Created At</span>
                  <SortIcon field="createdAt" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {paginatedAccounts.map((account, index) => (
              <tr
                key={account._id}
                className="group hover:bg-gradient-to-r hover:from-primary/[0.02] hover:via-primary/[0.03] hover:to-transparent transition-all duration-200"
                style={{
                  animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 flex items-center justify-center group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                      <Store className="h-5 w-5 text-orange-600" />
                      <div className="absolute inset-0 rounded-xl bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{account.accountName}</p>
                      <p className="text-xs text-muted-foreground">Amazon Seller</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{account.username}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-muted-foreground">••••••••</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-muted-foreground">••••••••</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="p-1.5 rounded-lg bg-muted/30">
                      <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <span>{formatDate(account.createdAt)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(account)}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 hover:scale-110 transition-all duration-200 rounded-lg"
                      title="Edit account"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(account)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50/80 hover:scale-110 transition-all duration-200 rounded-lg"
                      title="Delete account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-4 border-t border-border/50 bg-gradient-to-r from-muted/10 via-transparent to-muted/10">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, accounts.length)} of{" "}
            {accounts.length} accounts
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-sm border rounded px-2 py-1 bg-background"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-3">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Account Modal */}
      <EditAccountModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onAccountUpdated={onAccountDeleted}
        account={editingAccount}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        account={deletingAccount}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={deletingId === deletingAccount?._id}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}

