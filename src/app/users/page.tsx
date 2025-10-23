"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search,
  Plus,
  Edit,
  Trash2,
  Users as UsersIcon,
  Shield,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Mail,
  Phone
} from "lucide-react";
import { AddUserModal } from "@/components/add-user-modal";
import { EditUserModal } from "@/components/edit-user-modal";
import { DeleteUserModal } from "@/components/delete-user-modal";
import { useUser } from "@/contexts/user-context";

interface User {
  _id: string;
  email: string;
  role: "user" | "manager";
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

type SortField = 'email' | 'role' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function UsersPage() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 inline" />
      : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeClass = (role: string) => {
    return role === "manager"
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getRoleIcon = (role: string) => {
    return role === "manager" ? (
      <Shield className="h-4 w-4" />
    ) : (
      <UserIcon className="h-4 w-4" />
    );
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        user.email.toLowerCase().includes(searchStr) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchStr)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchStr));
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Sort users
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
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
  }, [filteredUsers, sortField, sortOrder]);

  // Paginate users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedUsers.slice(startIndex, startIndex + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  // Stats
  const totalUsers = users.length;
  const totalManagers = users.filter((u) => u.role === "manager").length;
  const totalRegularUsers = users.filter((u) => u.role === "user").length;
  
  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / pageSize);

  return (
    <div>
      {/* Action Button */}
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Managers</p>
              <p className="text-2xl font-bold text-purple-600">{totalManagers}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Regular Users</p>
              <p className="text-2xl font-bold text-blue-600">{totalRegularUsers}</p>
            </div>
            <UserIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 cursor-text"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background cursor-pointer"
            suppressHydrationWarning
          >
            <option value="all">All Roles</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || roleFilter !== "all"
                ? "No users match your search criteria."
                : "Get started by creating your first user."}
            </p>
            {(!searchTerm && roleFilter === "all") && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      User
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Contact
                    </th>
                    <th 
                      className="px-4 py-2 text-left text-sm font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('role')}
                    >
                      Role
                      <SortIcon field="role" />
                    </th>
                    <th 
                      className="px-4 py-2 text-left text-sm font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('createdAt')}
                    >
                      Created At
                      <SortIcon field="createdAt" />
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-3">
                          {user.avatar ? (
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} alt={user.email} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {user.firstName && user.lastName
                                  ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                                  : user.email?.substring(0, 2).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user.firstName || user.lastName || user.email}
                            </p>
                            {(user.firstName || user.lastName) && (
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="space-y-1">
                          {user.phone ? (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            disabled={currentUser?._id === user._id}
                            className={
                              currentUser?._id === user._id
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-red-600 hover:text-red-700 hover:bg-red-50"
                            }
                            title={currentUser?._id === user._id ? "You cannot delete your own account" : "Delete user"}
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
                  Showing {sortedUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, sortedUsers.length)} of{" "}
                  {sortedUsers.length} users
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-sm border rounded px-2 py-1 bg-background"
                  suppressHydrationWarning
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
                  Page {currentPage} of {totalPages || 1}
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
          </>
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={fetchUsers}
      />
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={fetchUsers}
        user={selectedUser}
      />
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onUserDeleted={fetchUsers}
        user={selectedUser}
      />
    </div>
  );
}

