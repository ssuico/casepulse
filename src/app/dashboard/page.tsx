"use client";

import { useState } from "react";
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for demonstration
const mockData = {
  totalCases: 1247,
  activeCases: 89,
  resolvedCases: 1158,
  urgentCases: 12,
  avgResponseTime: "2.4h",
  satisfactionRate: 94.2,
  recentActivity: [
    { id: 1, type: "new", caseId: "CASE-2024-001", account: "Brand A", time: "2 min ago" },
    { id: 2, type: "resolved", caseId: "CASE-2024-002", account: "Brand B", time: "5 min ago" },
    { id: 3, type: "urgent", caseId: "CASE-2024-003", account: "Brand C", time: "8 min ago" },
    { id: 4, type: "update", caseId: "CASE-2024-004", account: "Brand A", time: "12 min ago" },
    { id: 5, type: "new", caseId: "CASE-2024-005", account: "Brand D", time: "15 min ago" },
  ]
};

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 2000);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new":
        return <Activity className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "update":
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "new":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "resolved":
        return "bg-green-50 text-green-700 border-green-200";
      case "urgent":
        return "bg-red-50 text-red-700 border-red-200";
      case "update":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div>
      {/* Header Actions */}
      <div className="mb-6 flex items-center justify-end space-x-4">
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Cases */}
          <div className="relative bg-blue-600 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">
              <BarChart3 className="h-16 w-16 text-white" />
            </div>
            <div className="relative text-right">
              <p className="text-4xl font-bold text-white mb-1">{mockData.totalCases.toLocaleString()}</p>
              <p className="text-sm text-white/80 font-medium">Total Cases</p>
            </div>
          </div>

          {/* Active Cases */}
          <div className="relative bg-orange-500 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">
              <Activity className="h-16 w-16 text-white" />
            </div>
            <div className="relative text-right">
              <p className="text-4xl font-bold text-white mb-1">{mockData.activeCases}</p>
              <p className="text-sm text-white/80 font-medium">Active Cases</p>
            </div>
          </div>

          {/* Resolved Cases */}
          <div className="relative bg-green-600 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">
              <CheckCircle className="h-16 w-16 text-white" />
            </div>
            <div className="relative text-right">
              <p className="text-4xl font-bold text-white mb-1">{mockData.resolvedCases}</p>
              <p className="text-sm text-white/80 font-medium">Resolved Cases</p>
            </div>
          </div>

          {/* Urgent Cases */}
          <div className="relative bg-red-500 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">
              <AlertTriangle className="h-16 w-16 text-white" />
            </div>
            <div className="relative text-right">
              <p className="text-4xl font-bold text-white mb-1">{mockData.urgentCases}</p>
              <p className="text-sm text-white/80 font-medium">Urgent Cases</p>
            </div>
          </div>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Case Status Chart */}
          <div className="lg:col-span-2 bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Case Status Overview</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chart visualization would go here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Integration with charting library (Chart.js, Recharts, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {mockData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {activity.caseId}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getActivityColor(activity.type)}`}>
                        {activity.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.account}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full">
                View All Activity
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
