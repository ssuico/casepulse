"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Tag, Calendar, ExternalLink, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { EditBrandModal } from "@/components/edit-brand-modal";
import { DeleteBrandModal } from "@/components/delete-brand-modal";

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

interface Account {
  _id: string;
  accountName: string;
}

interface BrandsTableProps {
  brands: Brand[];
  onBrandDeleted: () => void;
  accounts: Account[];
}

type SortField = 'brandName' | 'sellerCentralAccountId.accountName' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function BrandsTable({ brands, onBrandDeleted, accounts }: BrandsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (brand: Brand) => {
    setDeletingBrand(brand);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    setDeletingId(id);

    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete brand");
      }

      setIsDeleteModalOpen(false);
      onBrandDeleted();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete brand");
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

  const sortedBrands = useMemo(() => {
    const sorted = [...brands].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === 'sellerCentralAccountId.accountName') {
        aValue = a.sellerCentralAccountId.accountName;
        bValue = b.sellerCentralAccountId.accountName;
      } else if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else {
        aValue = a.brandName;
        bValue = b.brandName;
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
  }, [brands, sortField, sortOrder]);

  const paginatedBrands = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedBrands.slice(startIndex, startIndex + pageSize);
  }, [sortedBrands, currentPage, pageSize]);

  const totalPages = Math.ceil(brands.length / pageSize);

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

  if (brands.length === 0) {
    return (
      <div className="text-center py-12 bg-card border rounded-lg">
        <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No brands yet</h3>
        <p className="text-muted-foreground mb-4">
          Add your first brand to get started.
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
                onClick={() => handleSort('brandName')}
              >
                Brand Name
                <SortIcon field="brandName" />
              </th>
              <th 
                className="px-4 py-2 text-left text-sm font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('sellerCentralAccountId.accountName')}
              >
                Seller Central Account
                <SortIcon field="sellerCentralAccountId.accountName" />
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Brand URL
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
            {paginatedBrands.map((brand) => (
              <tr
                key={brand._id}
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Tag className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{brand.brandName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <p className="text-sm">{brand.sellerCentralAccountId.accountName}</p>
                </td>
                <td className="px-4 py-2">
                  <a 
                    href={brand.brandUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <span className="max-w-[300px] truncate">{brand.brandUrl}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(brand.createdAt)}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(brand)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(brand)}
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
            {Math.min(currentPage * pageSize, brands.length)} of{" "}
            {brands.length} brands
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

      {/* Edit Brand Modal */}
      <EditBrandModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onBrandUpdated={onBrandDeleted}
        brand={editingBrand}
        accounts={accounts}
      />

      {/* Delete Brand Modal */}
      <DeleteBrandModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        brand={deletingBrand}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={deletingId === deletingBrand?._id}
      />
    </div>
  );
}

