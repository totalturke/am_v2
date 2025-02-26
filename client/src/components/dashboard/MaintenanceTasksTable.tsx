import { useState } from "react";
import { Plus, Info, Pencil } from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import TaskDetailsModal from "../maintenance/TaskDetailsModal";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Task {
  id: number;
  taskId: string;
  type: 'corrective' | 'preventive';
  issue: string;
  status: 'pending' | 'in_progress' | 'complete' | 'verified' | 'scheduled';
  reportedAt: string;
  assignedUser?: {
    id: number;
    name: string;
    avatar?: string;
  };
  apartment?: {
    id: number;
    apartmentNumber: string;
    building?: {
      id: number;
      name: string;
      city?: {
        id: number;
        name: string;
      };
    };
  };
}

interface MaintenanceTasksTableProps {
  tasks: Task[];
  onAddTask?: () => void;
}

export default function MaintenanceTasksTable({ tasks, onAddTask }: MaintenanceTasksTableProps) {
  const [cityFilter, setCityFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (cityFilter && task.apartment?.building?.city?.id.toString() !== cityFilter) {
      return false;
    }
    if (typeFilter && task.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Pendiente</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En Progreso</Badge>;
      case 'complete':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completado</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Verificado</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Programado</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };
  
  // Type badge styling
  const getTypeBadge = (type: string) => {
    return type === 'corrective' 
      ? <Badge variant="outline" className="bg-destructive/10 text-destructive hover:bg-destructive/10">Correctivo</Badge>
      : <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Preventivo</Badge>;
  };
  
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">Tareas de Mantenimiento Recientes</h2>
        <div className="mt-2 md:mt-0 flex space-x-2">
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todas las Ciudades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_cities">Todas las Ciudades</SelectItem>
              <SelectItem value="1">Ciudad de México</SelectItem>
              <SelectItem value="2">Cancún</SelectItem>
              <SelectItem value="3">Guadalajara</SelectItem>
              <SelectItem value="4">Monterrey</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todos los Tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_types">Todos los Tipos</SelectItem>
              <SelectItem value="corrective">Correctivo</SelectItem>
              <SelectItem value="preventive">Preventivo</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={onAddTask} size="sm" className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Añadir Tarea
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">ID de Tarea</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Tipo</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Apartamento</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Problema</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Asignado a</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Estado</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Fecha</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  className="hover:bg-neutral-50 cursor-pointer"
                  onClick={() => handleViewTask(task)}
                >
                  <TableCell className="text-sm font-medium text-neutral-900">{task.taskId}</TableCell>
                  <TableCell className="text-sm">{getTypeBadge(task.type)}</TableCell>
                  <TableCell className="text-sm text-neutral-600">
                    <div className="flex flex-col">
                      <span>
                        {task.apartment?.apartmentNumber && task.apartment.building?.name
                          ? `Apt ${task.apartment.apartmentNumber}, ${task.apartment.building.name}`
                          : "Desconocido"}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {task.apartment?.building?.city?.name || "Desconocida"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-600">{task.issue}</TableCell>
                  <TableCell className="text-sm text-neutral-600">
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
                      <span className="text-neutral-500 italic">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{getStatusBadge(task.status)}</TableCell>
                  <TableCell className="text-sm text-neutral-600">
                    {format(new Date(task.reportedAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary-600 hover:text-primary-900 focus:ring-primary-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewTask(task);
                      }}
                    >
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Ver</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-neutral-600 hover:text-neutral-900 focus:ring-primary-500 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit action
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-neutral-500">
                    No se encontraron tareas que coincidan con los filtros seleccionados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-neutral-200">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">5</span> de <span className="font-medium">{filteredTasks.length}</span> resultados
              </p>
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" className="hidden md:inline-flex">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal task={selectedTask} open={!!selectedTask} onClose={handleCloseModal} />
      )}
    </div>
  );
}
