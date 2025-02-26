import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Plus, Search, MapPin } from "lucide-react";

// Form schema for new city
const citySchema = z.object({
  name: z.string().min(1, "City name is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
});

export default function Cities() {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cities data
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["/api/cities"],
  });

  // City form
  const form = useForm<z.infer<typeof citySchema>>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: "",
      state: "",
      country: "Mexico",
    },
  });

  // Create city mutation
  const createCityMutation = useMutation({
    mutationFn: async (data: z.infer<typeof citySchema>) => {
      return apiRequest("POST", "/api/cities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({
        title: "City Created",
        description: "The city has been added successfully.",
      });
      setIsCreating(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create city. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter cities based on search query
  const filteredCities = cities.filter((city: any) => 
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submission
  const handleCreateCity = (data: z.infer<typeof citySchema>) => {
    createCityMutation.mutate(data);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-bold">Cities</h1>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add City
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Cities</CardTitle>
            <CardDescription>
              Manage cities where apartments are located
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex-1 mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="Search cities..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Buildings</TableHead>
                      <TableHead>Apartments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                          {searchQuery ? "No cities found matching your search" : "No cities found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCities.map((city: any) => (
                        <TableRow key={city.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-primary" />
                              {city.name}
                            </div>
                          </TableCell>
                          <TableCell>{city.state}</TableCell>
                          <TableCell>{city.country}</TableCell>
                          <TableCell>{city.buildingCount || "-"}</TableCell>
                          <TableCell>{city.apartmentCount || "-"}</TableCell>
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

      {/* Add City Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add City</DialogTitle>
            <DialogDescription>
              Add a new city where apartments are located
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateCity)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Mexico City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. CDMX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mexico" />
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
                  disabled={createCityMutation.isPending}
                >
                  {createCityMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create City'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
