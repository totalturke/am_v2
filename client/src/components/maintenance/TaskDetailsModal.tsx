import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Image, FileUp } from "lucide-react";

interface TaskDetailsModalProps {
  task: any;
  open: boolean;
  onClose: () => void;
}

export default function TaskDetailsModal({ task, open, onClose }: TaskDetailsModalProps) {
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, {
        status: "complete",
        completedAt: new Date().toISOString(),
        notes: notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Task completed",
        description: "The task has been marked as complete.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reassignTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      // In a real app, this would open a dialog to select a new agent
      return apiRequest("PATCH", `/api/tasks/${taskId}`, {
        status: "pending",
        assignedTo: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Task reassigned",
        description: "The task has been unassigned and is ready for reassignment.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reassign task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
      case 'complete':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Verified</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{priority}</Badge>;
    }
  };

  const handleComplete = () => {
    completeTaskMutation.mutate(task.id);
  };

  const handleReassign = () => {
    reassignTaskMutation.mutate(task.id);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg leading-6 font-medium text-neutral-900">
              Task Details: <span>{task.taskId}</span>
            </DialogTitle>
            <div>{getStatusBadge(task.status)}</div>
          </div>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-neutral-500 mb-2">Basic Information</h4>
            <div className="bg-neutral-50 p-4 rounded-md">
              <dl className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <dt className="font-medium text-neutral-600">Task Type:</dt>
                  <dd className="col-span-2 text-neutral-900">
                    {task.type === 'corrective' ? 'Corrective Maintenance' : 'Preventive Maintenance'}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <dt className="font-medium text-neutral-600">Issue:</dt>
                  <dd className="col-span-2 text-neutral-900">{task.issue}</dd>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <dt className="font-medium text-neutral-600">Apartment:</dt>
                  <dd className="col-span-2 text-neutral-900">
                    {task.apartment 
                      ? `Apt ${task.apartment.apartmentNumber}, ${task.apartment.building?.name || ''}`
                      : 'Unknown'}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <dt className="font-medium text-neutral-600">City:</dt>
                  <dd className="col-span-2 text-neutral-900">{task.apartment?.building?.city?.name || 'Unknown'}</dd>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <dt className="font-medium text-neutral-600">Date Reported:</dt>
                  <dd className="col-span-2 text-neutral-900">
                    {format(new Date(task.reportedAt), "MMM d, yyyy, h:mm a")}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <dt className="font-medium text-neutral-600">Reported By:</dt>
                  <dd className="col-span-2 text-neutral-900">{task.reportedBy || 'Unknown'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-500 mb-2">Assignment Details</h4>
            <div className="bg-neutral-50 p-4 rounded-md">
              <dl className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <dt className="font-medium text-neutral-600">Assigned To:</dt>
                  <dd className="col-span-2 text-neutral-900">
                    {task.assignedUser ? (
                      <div className="flex items-center">
                        <img 
                          src={task.assignedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedUser.name)}&background=random`} 
                          alt={task.assignedUser.name} 
                          className="h-6 w-6 rounded-full mr-2" 
                        />
                        <span>{task.assignedUser.name}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-500 italic">Unassigned</span>
                    )}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <dt className="font-medium text-neutral-600">Priority:</dt>
                  <dd className="col-span-2">{getPriorityBadge(task.priority)}</dd>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <dt className="font-medium text-neutral-600">Scheduled For:</dt>
                  <dd className="col-span-2 text-neutral-900">
                    {task.scheduledFor 
                      ? format(new Date(task.scheduledFor), "MMM d, yyyy, h:mm a")
                      : 'Not scheduled'}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <dt className="font-medium text-neutral-600">Estimated Duration:</dt>
                  <dd className="col-span-2 text-neutral-900">{task.estimatedDuration || 'Not specified'}</dd>
                </div>
              </dl>
              
              <div className="mt-5">
                <h5 className="text-sm font-medium text-neutral-600 mb-1">Issue Description:</h5>
                <p className="text-sm text-neutral-700 bg-white p-3 rounded border border-neutral-200">
                  {task.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-neutral-500 mb-2">Evidence and Documentation</h4>
          <div className="bg-neutral-50 p-4 rounded-md">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {task.evidencePhotos && task.evidencePhotos.length > 0 ? (
                task.evidencePhotos.slice(0, 2).map((photo: string, index: number) => (
                  <div key={index}>
                    <div className="aspect-w-16 aspect-h-9">
                      <img 
                        src={photo.startsWith('/uploads/') 
                          ? photo 
                          : `https://images.unsplash.com/photo-1580341289255-5b47c98a59df?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80`} 
                        alt={`Evidence ${index + 1}`} 
                        className="object-cover rounded-md w-full h-32" 
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Evidence photo {index + 1}</p>
                  </div>
                ))
              ) : (
                <div>
                  <div className="flex items-center justify-center border-2 border-dashed border-neutral-300 rounded-md bg-white h-32">
                    <div className="text-center">
                      <Image className="mx-auto h-10 w-10 text-neutral-400" />
                      <p className="mt-1 text-xs text-neutral-500">No evidence photos</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <div className="flex items-center justify-center border-2 border-dashed border-neutral-300 rounded-md bg-white h-32">
                  <div className="text-center">
                    <FileUp className="mx-auto h-10 w-10 text-neutral-400" />
                    <p className="mt-1 text-xs text-neutral-500">Upload photo</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Add new evidence</p>
              </div>

              {task.materials && task.materials.length > 0 && (
                <div>
                  <div className="h-32 p-3 bg-white border border-neutral-200 rounded-md overflow-y-auto">
                    <h5 className="text-xs font-medium text-neutral-700 mb-1">Materials Needed:</h5>
                    <ul className="text-xs text-neutral-600 list-disc pl-4 space-y-1">
                      {task.materials.map((item: any) => (
                        <li key={item.id}>
                          {item.material?.name} ({item.quantity} {item.material?.unit})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <label htmlFor="notes" className="block text-xs font-medium text-neutral-700 mb-1">Maintenance Notes:</label>
              <Textarea 
                id="notes" 
                rows={3} 
                className="w-full text-sm" 
                placeholder="Add maintenance notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          {task.status !== 'complete' && task.status !== 'verified' && (
            <Button 
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
              disabled={completeTaskMutation.isPending}
            >
              Mark as Complete
            </Button>
          )}
          
          {task.assignedUser && task.status !== 'complete' && task.status !== 'verified' && (
            <Button 
              variant="outline" 
              onClick={handleReassign}
              disabled={reassignTaskMutation.isPending}
            >
              Reassign Task
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
