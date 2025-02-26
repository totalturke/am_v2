import { useState, useEffect } from "react";
import { AppLayout } from "../App";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import DashboardStats from "../components/dashboard/DashboardStats";
import MaintenanceTasksTable from "../components/dashboard/MaintenanceTasksTable";
import ApartmentsGrid from "../components/dashboard/ApartmentsGrid";
import TaskForm from "../components/maintenance/TaskForm";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Fetch dashboard stats and data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  useEffect(() => {
    if (error) {
      toast({
        title: t('common.error'),
        description: t('dashboard.errorLoadingData'),
        variant: "destructive",
      });
    }
  }, [error, toast, t]);

  const handleAddTask = () => {
    setIsAddingTask(true);
  };

  const handleTaskFormClose = () => {
    setIsAddingTask(false);
  };

  return (
    <AppLayout>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Dashboard Stats */}
          <DashboardStats
            stats={{
              pendingTasks: dashboardData?.pendingTasks || 0,
              correctiveTasks: dashboardData?.correctiveTasks || 0,
              preventiveTasks: dashboardData?.preventiveTasks || 0,
              activeApartments: dashboardData?.activeApartments || 0,
            }}
          />

          {/* Maintenance Tasks Table */}
          <MaintenanceTasksTable
            tasks={dashboardData?.recentTasks || []}
            onAddTask={handleAddTask}
          />

          {/* Recently Maintained Apartments */}
          <ApartmentsGrid apartments={dashboardData?.recentApartments || []} />

          {/* Add Task Modal */}
          {isAddingTask && (
            <TaskForm open={isAddingTask} onClose={handleTaskFormClose} />
          )}
        </>
      )}
    </AppLayout>
  );
}
