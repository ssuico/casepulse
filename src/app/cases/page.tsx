"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ExternalLink
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

export default function CasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isClient, setIsClient] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

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

  const filteredCases = mockCases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          caseItem.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || caseItem.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
            disabled={selectedAccount === "all" || selectedBrand === "all"}
            className="whitespace-nowrap"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Request Cases
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
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cases</p>
              <p className="text-2xl font-bold">{mockCases.length}</p>
            </div>
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockCases.filter(c => c.status === "open").length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {mockCases.filter(c => c.status === "in_progress").length}
              </p>
            </div>
            <RefreshCw className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Urgent</p>
              <p className="text-2xl font-bold text-red-600">
                {mockCases.filter(c => c.priority === "urgent").length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Case ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Workspace</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Updated</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCases.map((caseItem) => (
                <tr key={caseItem.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(caseItem.status)}
                      <span className="font-mono text-sm font-medium">{caseItem.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{caseItem.title}</p>
                    <p className="text-sm text-muted-foreground">{caseItem.category}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{caseItem.workspace}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${getPriorityColor(caseItem.priority)}`}>
                      {caseItem.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(caseItem.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredCases.length === 0 && (
        <div className="text-center py-12 bg-card border rounded-lg">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No cases found</h3>
          <p className="text-muted-foreground mb-4">
            No cases match your current search or filter criteria.
          </p>
          <Button onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setPriorityFilter("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

