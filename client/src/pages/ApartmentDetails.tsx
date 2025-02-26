import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

// Define types for the apartment and tasks
interface Apartment {
  id: number;
  apartmentNumber: string;
  status: string;
  imageUrl: string | null;
  notes: string | null;
  lastMaintenance: string | Date | null;
  nextMaintenance: string | Date | null;
  bedroomCount: number;
  bathroomCount: number;
  squareMeters: number | null;
  buildingId: number;
  building?: {
    id: number;
    name: string;
    address?: string;
  };
  city?: {
    id: number;
    name: string;
  };
}

interface Task {
  id: number;
  taskId: string;
  type: 'corrective' | 'preventive';
  issue: string;
  status: string;
  reportedAt: string | Date;
  assignedTo?: number;
  priority?: string;
  description?: string;
}
import {
  Home,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  ClipboardList,
  Settings,
} from "lucide-react";
import { AppLayout } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApartmentDetails() {
  const { id } = useParams();
  const apartmentId = id ? parseInt(id) : null;

  // Fetch apartment details
  const { 
    data: apartment, 
    isLoading, 
    error 
  } = useQuery<Apartment>({
    queryKey: ["/api/apartments", apartmentId],
    enabled: !!apartmentId,
  });

  // Get tasks for this apartment
  const { 
    data: tasks = [] as Task[],
    isLoading: isLoadingTasks,
  } = useQuery<Task[]>({
    queryKey: ["/api/tasks", { apartmentId }],
    enabled: !!apartmentId,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <Skeleton className="h-8 w-48" />
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Skeleton className="h-64 w-full mb-4" />
                  <Skeleton className="h-6 w-full max-w-md mb-2" />
                  <Skeleton className="h-4 w-full max-w-sm" />
                </div>
                <div>
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (error || !apartment) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Apartamento no encontrado</h2>
          <p className="text-neutral-600 mb-6">No pudimos encontrar el apartamento que estás buscando.</p>
          <Link href="/apartments">
            <Button>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver a la lista de apartamentos
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Activo</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En Mantenimiento</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-neutral-100 text-neutral-800">Inactivo</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getTaskTypeBadge = (type: string) => {
    return type === 'corrective' 
      ? <Badge variant="outline" className="bg-red-100 text-red-800">Correctivo</Badge>
      : <Badge variant="outline" className="bg-green-100 text-green-800">Preventivo</Badge>;
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">En Progreso</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completado</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Verificado</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center">
            <Link href="/apartments">
              <Button variant="ghost" size="sm" className="mr-2">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Apartamento {apartment.apartmentNumber}</h1>
            {getStatusBadge(apartment.status)}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Actualizar Estado
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="relative h-64">
                  <img 
                    src={apartment.imageUrl || `https://source.unsplash.com/random/800x400/?apartment,${apartment.id}`} 
                    alt={`Apartment ${apartment.apartmentNumber}`} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h2 className="text-white text-xl font-bold">
                      Apt {apartment.apartmentNumber}, {apartment.building?.name}
                    </h2>
                    <p className="text-white/80 flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {apartment.building?.address || ""}, {apartment.city?.name || ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
                <TabsTrigger value="tasks">
                  Tareas ({isLoadingTasks ? "..." : tasks.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Información del Apartamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-2 text-neutral-500" />
                          <span className="font-medium">Habitaciones:</span>
                        </div>
                        <div className="col-span-2">{apartment.bedroomCount}</div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-2 text-neutral-500" />
                          <span className="font-medium">Baños:</span>
                        </div>
                        <div className="col-span-2">{apartment.bathroomCount}</div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-2 text-neutral-500" />
                          <span className="font-medium">Tamaño:</span>
                        </div>
                        <div className="col-span-2">{apartment.squareMeters} m²</div>
                      </div>
                      
                      {apartment.notes && (
                        <>
                          <Separator />
                          <div className="grid grid-cols-3 gap-4 items-start">
                            <div className="flex items-center">
                              <ClipboardList className="h-4 w-4 mr-2 text-neutral-500" />
                              <span className="font-medium">Notas:</span>
                            </div>
                            <div className="col-span-2">
                              <p className="text-neutral-700 whitespace-pre-line">{apartment.notes}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="maintenance" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Historial de Mantenimiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <h3 className="font-medium mb-2">Último Mantenimiento</h3>
                        {apartment.lastMaintenance ? (
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-green-600" />
                            <span className="font-semibold text-lg">{format(new Date(apartment.lastMaintenance), "d MMMM, yyyy")}</span>
                          </div>
                        ) : (
                          <div className="text-neutral-500">No hay registros de mantenimiento previo</div>
                        )}
                      </div>
                      
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <h3 className="font-medium mb-2">Próximo Mantenimiento Programado</h3>
                        {apartment.nextMaintenance ? (
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                            <span className="font-semibold text-lg">{format(new Date(apartment.nextMaintenance), "d MMMM, yyyy")}</span>
                          </div>
                        ) : (
                          <div className="text-neutral-500">No hay mantenimiento programado</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tasks" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Tareas de Mantenimiento</CardTitle>
                      <Link href={`/corrective-maintenance`}>
                        <Button size="sm">Nueva Tarea</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTasks ? (
                      <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : tasks.length > 0 ? (
                      <div className="space-y-3">
                        {tasks.map((task: Task) => (
                          <div key={task.id} className="border rounded-lg p-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <div>
                                <div className="flex flex-wrap gap-2 mb-1">
                                  {getTaskTypeBadge(task.type)}
                                  {getTaskStatusBadge(task.status)}
                                </div>
                                <h3 className="font-medium">{task.issue}</h3>
                                <p className="text-sm text-neutral-500">
                                  Reportado: {format(new Date(task.reportedAt), "d MMM, yyyy")}
                                </p>
                              </div>
                              <Link href={`/tasks/${task.id}`}>
                                <Button size="sm" variant="outline">Ver Detalles</Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        No hay tareas registradas para este apartamento
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Información del Edificio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm text-neutral-500">Nombre del Edificio</h3>
                    <p className="font-medium">{apartment.building?.name || "N/A"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm text-neutral-500">Ciudad</h3>
                    <p className="font-medium">{apartment.city?.name || "N/A"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm text-neutral-500">Dirección</h3>
                    <p className="font-medium">{apartment.building?.address || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href={`/buildings`}>
                  <Button variant="outline" className="w-full">Ver Todos los Edificios</Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/corrective-maintenance">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Reportar Problema
                  </Button>
                </Link>
                
                <Link href="/preventive-maintenance">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Programar Mantenimiento
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}