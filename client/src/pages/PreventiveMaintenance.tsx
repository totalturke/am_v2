import { useState, useEffect } from "react";
import { AppLayout } from "../App";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import TaskForm from "../components/maintenance/TaskForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { getStatusColor } from "@/lib/utils";
import TaskDetailsModal from "../components/maintenance/TaskDetailsModal";
import { Loader2, Plus, Filter, Search, Info, ArrowUpDown, Calendar } from "lucide-react";
import { format, addMonths, isBefore } from "date-fns";

export default function PreventiveMaintenance() {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("scheduledFor");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch preventive maintenance tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks", "preventive", filterStatus, filterCity, searchQuery, sortField, sortDirection],
    queryFn: async ({ queryKey }) => {
      const baseUrl = "/api/tasks?type=preventive";
      const statusParam = filterStatus ? `&status=${filterStatus}` : "";
      const cityParam = filterCity ? `&cityId=${filterCity}` : "";
      
      const response = await fetch(`${baseUrl}${statusParam}${cityParam}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      
      let tasks = await response.json();
      
      // Client-side filtering for search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        tasks = tasks.filter((task: any) => 
          task.taskId.toLowerCase().includes(query) ||
          task.issue.toLowerCase().includes(query) ||
          (task.apartment?.apartmentNumber && task.apartment.apartmentNumber.toLowerCase().includes(query)) ||
          (task.apartment?.building?.name && task.apartment.building.name.toLowerCase().includes(query))
        );
      }
      
      // Client-side sorting
      tasks.sort((a: any, b: any) => {
        let valueA, valueB;
        
        switch (sortField) {
          case "scheduledFor":
            valueA = a.scheduledFor ? new Date(a.scheduledFor).getTime() : Number.MAX_SAFE_INTEGER;
            valueB = b.scheduledFor ? new Date(b.scheduledFor).getTime() : Number.MAX_SAFE_INTEGER;
            break;
          case "taskId":
            valueA = a.taskId;
            valueB = b.taskId;
            break;
          default:
            valueA = a[sortField as keyof typeof a];
            valueB = b[sortField as keyof typeof b];
        }
        
        if (valueA === valueB) return 0;
        const comparison = valueA > valueB ? 1 : -1;
        return sortDirection === "desc" ? comparison * -1 : comparison;
      });
      
      return tasks;
    }
  });

  // Fetch apartments for preventive maintenance scheduling
  const { data: apartments = [] } = useQuery({
    queryKey: ["/api/apartments"],
  });

  // Fetch cities for filter
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
  });

  // Handle view task details
  const handleViewTask = (task: any) => {
    setSelectedTask(task);
  };

  // Handle add new task
  const handleAddTask = () => {
    setIsAddingTask(true);
  };

  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter apartments that need preventive maintenance
  const apartmentsNeedingMaintenance = apartments.filter((apartment: any) => {
    const nextMaintenanceDate = apartment.nextMaintenance 
      ? new Date(apartment.nextMaintenance) 
      : null;
    
    // Check if next maintenance is due within the next month or overdue
    return nextMaintenanceDate && isBefore(nextMaintenanceDate, addMonths(new Date(), 1));
  });

  // Schedule preventive maintenance for multiple apartments
  const scheduleBatchMutation = useMutation({
    mutationFn: async (apartmentIds: number[]) => {
      const promises = apartmentIds.map(id => {
        const apartment = apartments.find((a: any) => a.id === id);
        if (!apartment) return Promise.resolve();
        
        return apiRequest("POST", "/api/tasks", {
          taskId: `MT-${Math.floor(1000 + Math.random() * 9000)}`,
          type: "preventive",
          apartmentId: id,
          issue: "Scheduled 6-month maintenance",
          description: "Regular preventive maintenance check for apartment.",
          reportedBy: "System",
          priority: "medium",
          status: "scheduled",
          scheduledFor: addMonths(new Date(), 1).toISOString(),
        });
      });
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Preventive maintenance tasks have been scheduled.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule maintenance tasks. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleScheduleBatch = () => {
    if (apartmentsNeedingMaintenance.length === 0) {
      toast({
        title: "No apartments",
        description: "No apartments currently need preventive maintenance.",
      });
      return;
    }
    
    const apartmentIds = apartmentsNeedingMaintenance.map((a: any) => a.id);
    scheduleBatchMutation.mutate(apartmentIds.slice(0, 5)); // Limit to 5 for demo purposes
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-bold">Preventive Maintenance</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleScheduleBatch}
              disabled={scheduleBatchMutation.isPending || apartmentsNeedingMaintenance.length === 0}
              className="flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" />
              {scheduleBatchMutation.isPending ? "Scheduling..." : "Schedule Batch"}
            </Button>
            <Button onClick={handleAddTask} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              New Preventive Task
            </Button>
          </div>
        </div>

        {apartmentsNeedingMaintenance.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Apartments Due for Maintenance</CardTitle>
              <CardDescription>
                {apartmentsNeedingMaintenance.length} apartments need preventive maintenance within the next month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {apartmentsNeedingMaintenance.slice(0, 6).map((apartment: any) => (
                  <div 
                    key={apartment.id} 
                    className="p-3 border rounded-md flex justify-between items-center bg-amber-50 border-amber-200"
                  >
                    <div>
                      <p className="font-medium">
                        Apt {apartment.apartmentNumber}, {apartment.building?.name}
                      </p>
                      <p className="text-sm text-neutral-500">{apartment.city?.name}</p>
                      <p className="text-xs mt-1 text-amber-700">
                        Next maintenance: {apartment.nextMaintenance 
                          ? format(new Date(apartment.nextMaintenance), "MMM d, yyyy") 
                          : "Not scheduled"}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                    >
                      Schedule
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Preventive Maintenance Tasks</CardTitle>
            <CardDescription>
              View and manage all preventive maintenance tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2 text-neutral-500" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2 text-neutral-500" />
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    {cities.map((city: any) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("taskId")}
                      >
                        <div className="flex items-center gap-1">
                          Task ID
                          {sortField === "taskId" && (
                            <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Apartment</TableHead>
                      <TableHead>Maintenance Type</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("scheduledFor")}
                      >
                        <div className="flex items-center gap-1">
                          Scheduled For
                          {sortField === "scheduledFor" && (
                            <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                          {searchQuery || filterStatus || filterCity
                            ? "No tasks found matching the current filters"
                            : "No preventive maintenance tasks found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      tasks.map((task: any) => (
                        <TableRow key={task.id} className="cursor-pointer hover:bg-neutral-50" onClick={() => handleViewTask(task)}>
                          <TableCell className="font-medium">{task.taskId}</TableCell>
                          <TableCell>
                            <div>
                              {task.apartment?.apartmentNumber && task.apartment.building?.name
                                ? `Apt ${task.apartment.apartmentNumber}, ${task.apartment.building.name}`
                                : "Unknown"}
                              {task.apartment?.building?.city?.name && (
                                <div className="text-xs text-neutral-500">
                                  {task.apartment.building.city.name}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{task.issue}</TableCell>
                          <TableCell>
                            {task.assignedUser ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={task.assignedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedUser.name)}&background=random`}
                                  alt={task.assignedUser.name}
                                  className="h-6 w-6 rounded-full"
                                />
                                <span>{task.assignedUser.name}</span>
                              </div>
                            ) : (
                              <span className="text-neutral-500 italic">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {task.scheduledFor
                              ? format(new Date(task.scheduledFor), "MMM d, yyyy")
                              : "Not scheduled"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary-600 hover:text-primary-900"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTask(task);
                              }}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Add Task Modal */}
      {isAddingTask && (
        <TaskForm
          open={isAddingTask}
          taskType="preventive"
          onClose={() => setIsAddingTask(false)}
        />
      )}
    </AppLayout>
  );
}
