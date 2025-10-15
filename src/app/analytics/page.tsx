"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  const mockStats = {
    totalCases: 1247,
    resolvedCases: 1158,
    avgResolutionTime: "2.4h",
    customerSatisfaction: 94.2,
    responseRate: 98.5,
    escalationRate: 2.3,
  };

  const mockChartData = {
    caseVolume: [
      { period: "Week 1", cases: 287 },
      { period: "Week 2", cases: 312 },
      { period: "Week 3", cases: 298 },
      { period: "Week 4", cases: 350 },
    ],
    casesByStatus: [
      { status: "Resolved", count: 1158, percentage: 92.9 },
      { status: "Open", count: 45, percentage: 3.6 },
      { status: "In Progress", count: 32, percentage: 2.6 },
      { status: "Pending", count: 12, percentage: 0.9 },
    ],
    casesByPriority: [
      { priority: "Low", count: 567, percentage: 45.5 },
      { priority: "Medium", count: 498, percentage: 39.9 },
      { priority: "High", count: 156, percentage: 12.5 },
      { priority: "Urgent", count: 26, percentage: 2.1 },
    ],
    topWorkspaces: [
      { name: "Home Essentials", cases: 234, trend: "up" },
      { name: "Electronics Hub", cases: 178, trend: "up" },
      { name: "TechGear Pro", cases: 156, trend: "up" },
      { name: "Fashion Forward", cases: 89, trend: "down" },
      { name: "Sports Central", cases: 67, trend: "up" },
    ],
  };

  return (
    <div>
      {/* Header Actions */}
      <div className="mb-6 flex items-center justify-end space-x-2">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-background cursor-pointer"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Custom Range
        </Button>
        <Button size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12.5%
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Cases</p>
          <p className="text-3xl font-bold">{mockStats.totalCases.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">vs previous period</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8.2%
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Resolved Cases</p>
          <p className="text-3xl font-bold">{mockStats.resolvedCases.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {((mockStats.resolvedCases / mockStats.totalCases) * 100).toFixed(1)}% resolution rate
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <TrendingDown className="h-4 w-4 mr-1" />
              -15.3%
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Avg Resolution Time</p>
          <p className="text-3xl font-bold">{mockStats.avgResolutionTime}</p>
          <p className="text-xs text-muted-foreground mt-2">Faster than last period</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +3.1%
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Customer Satisfaction</p>
          <p className="text-3xl font-bold">{mockStats.customerSatisfaction}%</p>
          <p className="text-xs text-muted-foreground mt-2">Based on surveys</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +1.2%
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Response Rate</p>
          <p className="text-3xl font-bold">{mockStats.responseRate}%</p>
          <p className="text-xs text-muted-foreground mt-2">Within SLA</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex items-center text-red-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +0.8%
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Escalation Rate</p>
          <p className="text-3xl font-bold">{mockStats.escalationRate}%</p>
          <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Case Volume Chart */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Case Volume Trend</h3>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {mockChartData.caseVolume.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">{item.period}</span>
                  <span className="font-medium">{item.cases} cases</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(item.cases / 350) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cases by Status */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Cases by Status</h3>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {mockChartData.casesByStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === "Resolved" ? "bg-green-500" :
                    item.status === "Open" ? "bg-blue-500" :
                    item.status === "In Progress" ? "bg-yellow-500" :
                    "bg-gray-500"
                  }`} />
                  <span className="text-sm">{item.status}</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5 mx-3">
                    <div
                      className={`h-1.5 rounded-full ${
                        item.status === "Resolved" ? "bg-green-500" :
                        item.status === "Open" ? "bg-blue-500" :
                        item.status === "In Progress" ? "bg-yellow-500" :
                        "bg-gray-500"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{item.count}</p>
                  <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Priority */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6">Cases by Priority</h3>
          <div className="space-y-4">
            {mockChartData.casesByPriority.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.priority}</span>
                    <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.priority === "Urgent" ? "bg-red-500" :
                        item.priority === "High" ? "bg-orange-500" :
                        item.priority === "Medium" ? "bg-yellow-500" :
                        "bg-blue-500"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Workspaces */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6">Top Workspaces by Case Volume</h3>
          <div className="space-y-4">
            {mockChartData.topWorkspaces.map((workspace, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{workspace.name}</p>
                    <p className="text-sm text-muted-foreground">{workspace.cases} cases</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {workspace.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

