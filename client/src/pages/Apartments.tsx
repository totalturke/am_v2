import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
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
  const { t } = useTranslation();

  // Fetch apartments data
  const { data: apartments = [], isLoading } = useQuery({
    queryKey: ["/api/apartments"],
    queryFn: () => apiRequest("/api/apartments"),
  });

  // Fetch buildings for the dropdown
  const { data: buildings = [] } = useQuery({
    queryKey: ["/api/buildings"],
    queryFn: () => apiRequest("/api/buildings"),
  });

  // Fetch cities for the dropdown
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
    queryFn: () => apiRequest("/api/cities"),
  });

  // Form for creating new apartment
  const form = useForm<z.infer<typeof apartmentSchema>>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      apartmentNumber: "",
      buildingId: "",
      status: "active",
      bedroomCount: 1,
      bathroomCount: 1,
      squareMeters: 50,
      imageUrl: "",
      notes: "",
    },
  });

  // Create apartment mutation
  const createApartmentMutation = useMutation({
    mutationFn: (values: z.infer<typeof apartmentSchema>) => {
      return apiRequest("/api/apartments", {
        method: "POST",
        data: values,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apartments"] });
      toast({
        title: t("apartments.apartmentCreated"),
        description: t("apartments.apartmentCreatedSuccess"),
      });
      setIsCreating(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("apartments.errorCreatingApartment"),
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof apartmentSchema>) => {
    createApartmentMutation.mutate(values);
  };

  // View apartment details
  const handleViewApartment = (apartment: any) => {
    setSelectedApartment(apartment);
  };
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-bold">{t("apartments.title")}</h1>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            {t("apartments.add")}
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t("apartments.title")}</CardTitle>
            <CardDescription>
              {t("apartments.manage")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder={t("apartments.search")}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Filter controls here */}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Apartment cards would go here */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Apartment Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("apartments.add")}</DialogTitle>
            <DialogDescription>
              {t("apartments.addDescription")}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Form fields would go here */}
              <DialogFooter>
                <Button type="submit" disabled={createApartmentMutation.isPending}>
                  {createApartmentMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("apartments.save")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Apartment Dialog */}
      {selectedApartment && (
        <Dialog open={!!selectedApartment} onOpenChange={() => setSelectedApartment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t("apartments.apartment")} {selectedApartment.apartmentNumber}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Apartment details would go here */}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApartment(null)}>{t("apartments.close")}</Button>
              <Button>{t("apartments.scheduleMaintenance")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
