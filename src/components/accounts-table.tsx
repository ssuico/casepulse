"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, User, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Pencil } from "lucide-react";
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
              <th 
                className="px-4 py-2 text-left text-sm font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('accountName')}
              >
                Account Name
                <SortIcon field="accountName" />
              </th>
              <th 
                className="px-4 py-2 text-left text-sm font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('username')}
              >
                Username
                <SortIcon field="username" />
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Password
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                2FA Key
              </th>
              <th 
                className="px-4 py-2 text-left text-sm font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                Created At
                <SortIcon field="createdAt" />
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedAccounts.map((account) => (
              <tr
                key={account._id}
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{account.accountName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <p className="text-sm">{account.username}</p>
                </td>
                <td className="px-4 py-2">
                  <span className="text-sm text-muted-foreground">
                    ••••••••
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className="text-sm text-muted-foreground">
                    ••••••••
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(account.createdAt)}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(account)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(account)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
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

