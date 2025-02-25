import { BarChart, ChevronUp, Clock, Home, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  stats: {
    pendingTasks: number;
    correctiveTasks: number;
    preventiveTasks: number;
    activeApartments: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Pending Tasks Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">Pending Tasks</p>
              <p className="text-2xl font-semibold mt-1">{stats.pendingTasks}</p>
            </div>
            <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Progress</span>
              <span className="text-xs font-medium text-neutral-900">65%</span>
            </div>
            <Progress value={65} className="h-2 mt-1" />
          </div>
        </CardContent>
      </Card>
      
      {/* Corrective Tasks Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">Corrective Tasks</p>
              <p className="text-2xl font-semibold mt-1">{stats.correctiveTasks}</p>
            </div>
            <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-destructive">
            <ChevronUp className="h-4 w-4 mr-1" />
            <span>4 new since yesterday</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Preventive Tasks Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">Preventive Tasks</p>
              <p className="text-2xl font-semibold mt-1">{stats.preventiveTasks}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>On schedule</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Active Apartments Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">Active Apartments</p>
              <p className="text-2xl font-semibold mt-1">{stats.activeApartments}</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Home className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-neutral-600">
            <BarChart className="h-4 w-4 mr-1" />
            <span>98% of total inventory</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
