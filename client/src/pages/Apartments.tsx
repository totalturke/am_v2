import { useState } from "react";
import { AppLayout } from "../App";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Plus, Search, MapPin, Building, Calendar, HomeIcon } from "lucide-react";
import { format } from "date-fns";

// Form schema for new apartment
const apartmentSchema = z.object({
  apartmentNumber: z.string().min(1, "Apartment number is required"),
  buildingId: z.string().min(1, "Building is required"),
  status: z.string().min(1, "Status is required"),
  bedroomCount: z.number().min(1, "Bedroom count must be at least 1"),
  bathroomCount: z.number().min(1, "Bathroom count must be at least 1"),
  squareMeters: z.number().min(1, "Square meters must be at least 1"),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
});

export default function Apartments() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all_buildings");
  const [cityFilter, setCityFilter] = useState("all_cities");
  const [statusFilter, setStatusFilter] = useState("all_status");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch apartments data
  const { data: apartments = [], isLoading } = useQuery({
    queryKey: ["/api/apartments", buildingFilter, cityFilter, statusFilter],
    queryFn: async ({ queryKey }) => {
      const [_, buildingId, cityId, status] = queryKey;
      let url = "/api/apartments";
      
      if (buildingId && buildingId !== "all_buildings") {
        url += `?buildingId=${buildingId}`;
      }
      
      // Server doesn't support these filters directly, so we'll filter client-side
      return fetch(url).then(res => {
        if (!res.ok) throw new Error("Failed to fetch apartments");
        return res.json();
      }).then(data => {
        // Client-side filtering for city and status
        let filtered = data;
        
        if (cityId && cityId !== "all_cities") {
          filtered = filtered.filter((apt: any) => apt.city?.id.toString() === cityId);
        }
        
        if (status && status !== "all_status") {
          filtered = filtered.filter((apt: any) => apt.status === status);
        }
        
        return filtered;
      });
    }
  });

  // Fetch buildings data for filter and form
  const { data: buildings = [] } = useQuery({
    queryKey: ["/api/buildings"],
  });

  // Fetch cities data for filter
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
  });

  // Apartment form
  const form = useForm<z.infer<typeof apartmentSchema>>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      apartmentNumber: "",
      buildingId: "",
      status: "active",
      bedroomCount: 1,
      bathroomCount: 1,
      squareMeters: 50,
      notes: "",
      imageUrl: "",
    },
  });

  // Create apartment mutation
  const createApartmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof apartmentSchema>) => {
      return apiRequest("POST", "/api/apartments", {
        ...data,
        buildingId: parseInt(data.buildingId),
        bedroomCount: Number(data.bedroomCount),
        bathroomCount: Number(data.bathroomCount),
        squareMeters: Number(data.squareMeters),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apartments"] });
      toast({
        title: "Apartment Created",
        description: "The apartment has been added successfully.",
      });
      setIsCreating(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create apartment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter apartments based on search query
  const filteredApartments = apartments.filter((apartment: any) => 
    apartment.apartmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apartment.building?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apartment.city?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submission
  const handleCreateApartment = (data: z.infer<typeof apartmentSchema>) => {
    createApartmentMutation.mutate(data);
  };

  // Get status badge for apartment
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500 text-white">Maintenance</Badge>;
      case 'inactive':
        return <Badge className="bg-neutral-500 text-white">Inactive</Badge>;
      default:
        return <Badge className="bg-neutral-500 text-white">{status}</Badge>;
    }
  };

  // View apartment details
  const handleViewApartment = (apartment: any) => {
    setSelectedApartment(apartment);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-bold">Apartments</h1>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Apartment
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Apartments</CardTitle>
            <CardDescription>
              Manage apartments across all buildings and cities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search apartments..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <MapPin className="h-4 w-4 mr-2 text-neutral-500" />
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_cities">All Cities</SelectItem>
                    {cities.map((city: any) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Building className="h-4 w-4 mr-2 text-neutral-500" />
                    <SelectValue placeholder="All Buildings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_buildings">All Buildings</SelectItem>
                    {buildings.map((building: any) => (
                      <SelectItem key={building.id} value={building.id.toString()}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_status">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApartments.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-neutral-500">
                    {searchQuery || cityFilter || buildingFilter || statusFilter
                      ? "No apartments found matching your search"
                      : "No apartments found"}
                  </div>
                ) : (
                  filteredApartments.map((apartment: any) => (
                    <Card 
                      key={apartment.id} 
                      className="overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                      onClick={() => handleViewApartment(apartment)}
                    >
                      <div className="relative h-40">
                        <img 
                          src={apartment.imageUrl || `https://source.unsplash.com/random/600x400/?apartment,${apartment.id}`} 
                          alt={`Apartment ${apartment.apartmentNumber}`} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-0 right-0 m-2">
                          {getStatusBadge(apartment.status)}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-neutral-900">
                              Apt {apartment.apartmentNumber}, {apartment.building?.name}
                            </h3>
                            <p className="text-sm text-neutral-500">{apartment.city?.name}</p>
                          </div>
                          <div className="bg-primary-50 text-primary-700 text-xs font-medium px-2 py-1 rounded-md">
                            ID: #{`A-${10000 + apartment.id}`}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center text-sm">
                          <Calendar className="h-4 w-4 text-neutral-500 mr-1" />
                          <span className="text-neutral-600">
                            Last maintenance: {apartment.lastMaintenance 
                              ? format(new Date(apartment.lastMaintenance), "d MMM yyyy")
                              : "Not yet maintained"}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <div className="flex items-center">
                            <HomeIcon className="h-4 w-4 text-neutral-500 mr-1" />
                            <span>{apartment.bedroomCount} bd</span>
                          </div>
                          <div className="flex items-center">
                            <span>{apartment.bathroomCount} ba</span>
                          </div>
                          <div className="flex items-center">
                            <span>{apartment.squareMeters} m²</span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between">
                          <div>
                            <div className="text-xs text-neutral-500 mb-1">Next scheduled maintenance</div>
                            <div className="text-sm font-medium">
                              {apartment.nextMaintenance 
                                ? format(new Date(apartment.nextMaintenance), "MMM d, yyyy")
                                : "Not scheduled"}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="inline-flex items-center border-primary-300 text-primary-700 hover:bg-primary-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewApartment(apartment);
                            }}
                          >
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Apartment Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Apartment</DialogTitle>
            <DialogDescription>
              Add a new apartment to the system
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateApartment)} className="space-y-4">
              <FormField
                control={form.control}
                name="apartmentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apartment Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 101" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="buildingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a building" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {buildings.map((building: any) => (
                          <SelectItem key={building.id} value={building.id.toString()}>
                            {building.name} - {building.city?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bedroomCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bathroomCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="squareMeters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Meters</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 50)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Any additional notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createApartmentMutation.isPending}
                >
                  {createApartmentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Apartment'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Apartment Details Dialog */}
      {selectedApartment && (
        <Dialog open={!!selectedApartment} onOpenChange={(open) => !open && setSelectedApartment(null)}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Apartment {selectedApartment.apartmentNumber} - {selectedApartment.building?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedApartment.city?.name}, {selectedApartment.city?.state}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="overflow-hidden rounded-md">
                  <img 
                    src={selectedApartment.imageUrl || `https://source.unsplash.com/random/600x400/?apartment,${selectedApartment.id}`} 
                    alt={`Apartment ${selectedApartment.apartmentNumber}`} 
                    className="w-full h-48 object-cover" 
                  />
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-neutral-500">Status:</span>
                    <span>{getStatusBadge(selectedApartment.status)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-neutral-500">Bedrooms:</span>
                    <span>{selectedApartment.bedroomCount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-neutral-500">Bathrooms:</span>
                    <span>{selectedApartment.bathroomCount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-neutral-500">Size:</span>
                    <span>{selectedApartment.squareMeters} m²</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">Maintenance History</h3>
                  <div className="bg-neutral-50 rounded-md p-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Last Maintenance:</span>
                      <span className="text-sm">
                        {selectedApartment.lastMaintenance
                          ? format(new Date(selectedApartment.lastMaintenance), "MMM d, yyyy")
                          : "No record"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Next Scheduled:</span>
                      <span className="text-sm">
                        {selectedApartment.nextMaintenance
                          ? format(new Date(selectedApartment.nextMaintenance), "MMM d, yyyy")
                          : "Not scheduled"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">Recent Tasks</h3>
                  {selectedApartment.tasks && selectedApartment.tasks.length > 0 ? (
                    <div className="space-y-2">
                      {selectedApartment.tasks.slice(0, 3).map((task: any) => (
                        <div key={task.id} className="bg-white border rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">{task.issue}</p>
                              <p className="text-xs text-neutral-500">
                                {format(new Date(task.reportedAt), "MMM d, yyyy")}
                              </p>
                            </div>
                            <Badge className={task.type === 'corrective' 
                              ? "bg-red-100 text-red-800" 
                              : "bg-green-100 text-green-800"}
                            >
                              {task.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-neutral-50 rounded-md p-3 text-center text-sm text-neutral-500">
                      No maintenance tasks recorded
                    </div>
                  )}
                </div>
                
                {selectedApartment.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 mb-2">Notes</h3>
                    <div className="bg-neutral-50 rounded-md p-3">
                      <p className="text-sm">{selectedApartment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApartment(null)}>Close</Button>
              <Button>Schedule Maintenance</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
