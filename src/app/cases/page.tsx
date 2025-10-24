"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/alert-modal";
import { 
  Search,
  Filter,
  Download,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";

// Mock case data
const mockCases = [
  {
    id: "CASE-2024-001",
    title: "Product listing issue - ASIN not appearing",
    workspace: "TechGear Pro",
    status: "open",
    priority: "urgent",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    assignee: "Amazon Support",
    category: "Listing Management"
  },
  {
    id: "CASE-2024-002",
    title: "Payment discrepancy in last settlement",
    workspace: "Fashion Forward",
    status: "in_progress",
    priority: "high",
    createdAt: "2024-01-14T09:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
    assignee: "Finance Team",
    category: "Payments"
  },
  {
    id: "CASE-2024-003",
    title: "Inventory not syncing properly",
    workspace: "Home Essentials",
    status: "resolved",
    priority: "medium",
    createdAt: "2024-01-13T14:20:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
    assignee: "Technical Support",
    category: "Inventory"
  },
  {
    id: "CASE-2024-004",
    title: "Brand registry verification needed",
    workspace: "Sports Central",
    status: "pending",
    priority: "low",
    createdAt: "2024-01-12T11:15:00Z",
    updatedAt: "2024-01-12T11:15:00Z",
    assignee: "Brand Team",
    category: "Brand Protection"
  },
  {
    id: "CASE-2024-005",
    title: "Customer return policy question",
    workspace: "Electronics Hub",
    status: "open",
    priority: "medium",
    createdAt: "2024-01-15T08:45:00Z",
    updatedAt: "2024-01-15T13:20:00Z",
    assignee: "Customer Service",
    category: "Policy"
  },
];

interface Account {
  _id: string;
  accountName: string;
}

interface Brand {
  _id: string;
  brandName: string;
  sellerCentralAccountId: {
    _id: string;
    accountName: string;
  };
  brandUrl: string;
}

type SortField = 'id' | 'title' | 'status' | 'priority' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export default function CasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isClient, setIsClient] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [isRequestingCases, setIsRequestingCases] = useState(false);
  
  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <FileText className="h-4 w-4" />;
      case "in_progress":
        return <RefreshCw className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    // Only format dates on client side to prevent hydration mismatch
    if (!isClient) {
      return new Date(dateString).toLocaleDateString();
    }
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 inline-block ml-1" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 inline-block ml-1" /> 
      : <ArrowDown className="h-4 w-4 inline-block ml-1" />;
  };

  const filteredCases = mockCases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          caseItem.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || caseItem.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort cases
  const sortedCases = [...filteredCases].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'id':
        comparison = a.id.localeCompare(b.id);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        comparison = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedCases.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCases = sortedCases.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    setIsClient(true);
    fetchAccounts();
    fetchBrands();
  }, []);

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts");
      const data = await response.json();
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    }
  };

  // Fetch brands
  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  // Filter brands based on selected account
  const filteredBrands = selectedAccount === "all" 
    ? brands 
    : brands.filter(brand => brand.sellerCentralAccountId._id === selectedAccount);

  // Reset brand selection when account changes
  useEffect(() => {
    setSelectedBrand("all");
  }, [selectedAccount]);

  // Handle request cases button click
  const handleRequestCases = async () => {
    if (selectedAccount === "all" || selectedBrand === "all") {
      return;
    }

    setIsRequestingCases(true);
    
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: selectedAccount,
          brandId: selectedBrand,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert(
          "Scraper Started",
          `Scraper started for ${data.data.brandName}!\nCheck the browser window.`,
          "success"
        );
      } else {
        showAlert(
          "Scraper Failed",
          `Failed to start scraper: ${data.message}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to request cases:", error);
      showAlert(
        "Error",
        "Failed to start scraper. Please try again.",
        "error"
      );
    } finally {
      setIsRequestingCases(false);
    }
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="mb-6 flex justify-end">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      {/* Account and Brand Filters */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background cursor-pointer flex-1 sm:flex-initial"
            suppressHydrationWarning
          >
            <option value="all">All Accounts</option>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.accountName}
              </option>
            ))}
          </select>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background cursor-pointer flex-1 sm:flex-initial"
            disabled={selectedAccount === "all" && brands.length > 0}
            suppressHydrationWarning
          >
            <option value="all">All Brands</option>
            {filteredBrands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.brandName}
              </option>
            ))}
          </select>
          <Button 
            size="sm"
            disabled={selectedAccount === "all" || selectedBrand === "all" || isRequestingCases}
            className="whitespace-nowrap"
            onClick={handleRequestCases}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRequestingCases ? 'animate-spin' : ''}`} />
            {isRequestingCases ? "Starting..." : "Request Cases"}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases by ID or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 cursor-text"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background cursor-pointer"
              suppressHydrationWarning
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background cursor-pointer"
              suppressHydrationWarning
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Cases Card */}
        <div className="relative bg-[#4b7bec] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">
            <FileText className="h-16 w-16 text-white" />
          </div>
          <div className="relative text-right">
            <p className="text-4xl font-bold text-white mb-1">{mockCases.length}</p>
            <p className="text-sm text-white/80 font-medium">Total Cases</p>
          </div>
        </div>

        {/* Open Cases Card */}
        <div className="relative bg-[#4b7bec] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">
            <FileText className="h-16 w-16 text-white" />
          </div>
          <div className="relative text-right">
            <p className="text-4xl font-bold text-white mb-1">
              {mockCases.filter(c => c.status === "open").length}
            </p>
            <p className="text-sm text-white/80 font-medium">Open Cases</p>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="relative bg-[#4b7bec] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">
            <RefreshCw className="h-16 w-16 text-white" />
          </div>
          <div className="relative text-right">
            <p className="text-4xl font-bold text-white mb-1">
              {mockCases.filter(c => c.status === "in_progress").length}
            </p>
            <p className="text-sm text-white/80 font-medium">In Progress</p>
          </div>
        </div>

        {/* Urgent Cases Card */}
        <div className="relative bg-[#4b7bec] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">
            <AlertTriangle className="h-16 w-16 text-white" />
          </div>
          <div className="relative text-right">
            <p className="text-4xl font-bold text-white mb-1">
              {mockCases.filter(c => c.priority === "urgent").length}
            </p>
            <p className="text-sm text-white/80 font-medium">Urgent Priority</p>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-gradient-to-br from-card via-card to-primary/[0.02] border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-muted/50 via-muted/40 to-muted/50 border-b border-border/50">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/60 transition-all duration-200 group"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    <span>Case ID</span>
                    <SortIcon field="id" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/60 transition-all duration-200 group"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-1">
                    <span>Title</span>
                    <SortIcon field="title" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Workspace</th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/60 transition-all duration-200 group"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <SortIcon field="status" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/60 transition-all duration-200 group"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <SortIcon field="priority" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/60 transition-all duration-200 group"
                  onClick={() => handleSort('updatedAt')}
                >
                  <div className="flex items-center gap-1">
                    <span>Updated</span>
                    <SortIcon field="updatedAt" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedCases.map((caseItem, index) => (
                <tr 
                  key={caseItem.id} 
                  className="group hover:bg-gradient-to-r hover:from-primary/[0.02] hover:via-primary/[0.03] hover:to-transparent transition-all duration-200"
                  style={{
                    animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                      {getStatusIcon(caseItem.status)}
                      </div>
                      <span className="font-mono text-sm font-semibold">{caseItem.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground mb-0.5">{caseItem.title}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                          {caseItem.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">{caseItem.workspace}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border shadow-sm ${getStatusColor(caseItem.status)}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      {caseItem.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border shadow-sm ${getPriorityColor(caseItem.priority)}`}>
                      <AlertTriangle className="h-3 w-3" />
                      {caseItem.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="p-1.5 rounded-lg bg-muted/30">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <span>{formatDate(caseItem.updatedAt)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10 hover:scale-110 transition-all duration-200 rounded-lg"
                        title="View details"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted hover:scale-110 transition-all duration-200 rounded-lg"
                        title="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
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
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border rounded-md bg-background cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, sortedCases.length)} of {sortedCases.length} cases
            </span>
          </div>

          <div className="flex items-center space-x-2">
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
            <span className="text-sm">
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
      </div>

      {/* Empty State */}
      {sortedCases.length === 0 && (
        <div className="relative text-center py-16 bg-gradient-to-br from-card via-card to-primary/5 border rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-50" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No cases found</h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            No cases match your current search or filter criteria.
          </p>
            <Button 
              onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setPriorityFilter("all");
              }}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
            Clear Filters
          </Button>
          </div>
        </div>
      )}

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

