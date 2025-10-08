"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  MoreVertical
} from "lucide-react";

// Mock workspace data
const mockWorkspaces = [
  {
    id: 1,
    name: "TechGear Pro",
    type: "1P",
    status: "active",
    totalCases: 156,
    activeCases: 12,
    resolvedCases: 144,
    urgentCases: 2,
    avgResponseTime: "1.8h",
    satisfactionRate: 96.2,
    lastActivity: "2 minutes ago",
    trend: "up",
    trendValue: "+15%"
  },
  {
    id: 2,
    name: "Fashion Forward",
    type: "2P",
    status: "active",
    totalCases: 89,
    activeCases: 8,
    resolvedCases: 81,
    urgentCases: 1,
    avgResponseTime: "2.1h",
    satisfactionRate: 94.5,
    lastActivity: "5 minutes ago",
    trend: "up",
    trendValue: "+8%"
  },
  {
    id: 3,
    name: "Home Essentials",
    type: "3P",
    status: "warning",
    totalCases: 234,
    activeCases: 23,
    resolvedCases: 211,
    urgentCases: 5,
    avgResponseTime: "3.2h",
    satisfactionRate: 91.8,
    lastActivity: "1 minute ago",
    trend: "down",
    trendValue: "-3%"
  },
  {
    id: 4,
    name: "Sports Central",
    type: "2P",
    status: "active",
    totalCases: 67,
    activeCases: 4,
    resolvedCases: 63,
    urgentCases: 0,
    avgResponseTime: "1.5h",
    satisfactionRate: 98.1,
    lastActivity: "8 minutes ago",
    trend: "up",
    trendValue: "+22%"
  },
  {
    id: 5,
    name: "Beauty & Wellness",
    type: "1P",
    status: "inactive",
    totalCases: 45,
    activeCases: 0,
    resolvedCases: 45,
    urgentCases: 0,
    avgResponseTime: "2.8h",
    satisfactionRate: 95.6,
    lastActivity: "2 hours ago",
    trend: "neutral",
    trendValue: "0%"
  },
  {
    id: 6,
    name: "Electronics Hub",
    type: "3P",
    status: "active",
    totalCases: 178,
    activeCases: 15,
    resolvedCases: 163,
    urgentCases: 3,
    avgResponseTime: "2.5h",
    satisfactionRate: 93.2,
    lastActivity: "3 minutes ago",
    trend: "up",
    trendValue: "+12%"
  }
];

export default function WorkspacesPage() {
  const [filter, setFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "1P":
        return "bg-blue-100 text-blue-800";
      case "2P":
        return "bg-purple-100 text-purple-800";
      case "3P":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredWorkspaces = mockWorkspaces.filter(workspace => {
    if (filter === "all") return true;
    return workspace.status === filter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Workspaces</h1>
              <p className="text-muted-foreground mt-1">
                Manage your Amazon accounts and brands
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Workspace
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({mockWorkspaces.length})
            </Button>
            <Button
              variant={filter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("active")}
            >
              Active ({mockWorkspaces.filter(w => w.status === "active").length})
            </Button>
            <Button
              variant={filter === "warning" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("warning")}
            >
              Warning ({mockWorkspaces.filter(w => w.status === "warning").length})
            </Button>
            <Button
              variant={filter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("inactive")}
            >
              Inactive ({mockWorkspaces.filter(w => w.status === "inactive").length})
            </Button>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="bg-card border rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/20"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{workspace.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(workspace.status)}`}>
                      {workspace.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(workspace.type)}`}>
                      {workspace.type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Last activity: {workspace.lastActivity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{workspace.totalCases}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Cases</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-600">{workspace.activeCases}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">{workspace.resolvedCases}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-2xl font-bold text-red-600">{workspace.urgentCases}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Urgent</p>
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Response Time</span>
                  <span className="font-medium">{workspace.avgResponseTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Satisfaction Rate</span>
                  <span className="font-medium">{workspace.satisfactionRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">This Month</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(workspace.trend)}
                    <span className={`font-medium ${
                      workspace.trend === "up" ? "text-green-600" : 
                      workspace.trend === "down" ? "text-red-600" : 
                      "text-gray-600"
                    }`}>
                      {workspace.trendValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button asChild className="flex-1" size="sm">
                  <Link href={`/workspaces/${workspace.id}`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Cases
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredWorkspaces.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workspaces found</h3>
            <p className="text-muted-foreground mb-4">
              No workspaces match your current filter criteria.
            </p>
            <Button onClick={() => setFilter("all")}>
              View All Workspaces
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
