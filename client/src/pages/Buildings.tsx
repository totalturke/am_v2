import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
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
import { Loader2, Plus, Search, Building, MapPin, HomeIcon } from "lucide-react";

// Form schema for new building
const buildingSchema = z.object({
  name: z.string().min(1, "Building name is required"),
  address: z.string().min(1, "Address is required"),
  cityId: z.string().min(1, "City is required"),
  totalUnits: z.number().min(1, "Total units must be at least 1"),
});

export default function Buildings() {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Fetch buildings data
  const { data: buildings = [], isLoading } = useQuery({
    queryKey: ["/api/buildings", cityFilter],
    queryFn: async ({ queryKey }) => {
      const [_, cityId] = queryKey;
      const url = cityId ? `/api/buildings?cityId=${cityId}` : "/api/buildings";
      return fetch(url).then(res => {
        if (!res.ok) throw new Error("Failed to fetch buildings");
        return res.json();
      });
    }
  });

  // Fetch cities data for filter and form
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
  });

  // Building form
  const form = useForm<z.infer<typeof buildingSchema>>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      name: "",
      address: "",
      cityId: "",
      totalUnits: 1,
    },
  });

  // Create building mutation
  const createBuildingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof buildingSchema>) => {
      return apiRequest("POST", "/api/buildings", {
        ...data,
        cityId: parseInt(data.cityId), // Convert string to number
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buildings"] });
      toast({
        title: t("buildings.buildingCreated"),
        description: t("buildings.buildingCreatedSuccess"),
      });
      setIsCreating(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("buildings.errorCreatingBuilding"),
        variant: "destructive",
      });
    },
  });

  // Filter buildings based on search and city filter
  const filteredBuildings = buildings.filter((building: any) => {
    const matchesSearch = searchQuery === "" || 
      building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === "" || cityFilter === "all_cities" || building.cityId.toString() === cityFilter;
    
    return matchesSearch && matchesCity;
  });

  // Handle form submission
  const handleCreateBuilding = (data: z.infer<typeof buildingSchema>) => {
    createBuildingMutation.mutate(data);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-bold">{t("buildings.title")}</h1>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            {t("buildings.add")}
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t("buildings.title")}</CardTitle>
            <CardDescription>
              {t("buildings.manage")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder={t("buildings.search")}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-[180px]">
                  <MapPin className="h-4 w-4 mr-2 text-neutral-500" />
                  <SelectValue placeholder={t("buildings.allCities")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_cities">{t("buildings.allCities")}</SelectItem>
                  {cities.map((city: any) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-neutral-500" /></div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("buildings.name")}</TableHead>
                      <TableHead>{t("buildings.address")}</TableHead>
                      <TableHead>{t("buildings.city")}</TableHead>
                      <TableHead>{t("buildings.totalUnits")}</TableHead>
                      <TableHead>{t("buildings.activeUnits")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBuildings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                          {searchQuery || cityFilter 
                            ? t("buildings.noFoundMatching") 
                            : t("buildings.noFound")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBuildings.map((building: any) => (
                        <TableRow key={building.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2 text-primary" />
                              {building.name}
                            </div>
                          </TableCell>
                          <TableCell>{building.address}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-neutral-500" />
                              {building.city?.name || t("Unknown")}
                            </div>
                          </TableCell>
                          <TableCell>{building.totalUnits}</TableCell>
                          <TableCell className="flex items-center">
                            <HomeIcon className="h-4 w-4 mr-1 text-green-600" />
                            {building.activeUnits || "-"}
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

      {/* Add Building Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("buildings.add")}</DialogTitle>
            <DialogDescription>
              {t("buildings.addDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateBuilding)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("buildings.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("buildings.namePlaceholder")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("buildings.address")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("buildings.addressPlaceholder")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("buildings.city")}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("buildings.selectCity")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities.map((city: any) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}, {city.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="totalUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("buildings.totalUnits")}</FormLabel>
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
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBuildingMutation.isPending}
                >
                  {createBuildingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("buildings.creating")}
                    </>
                  ) : (
                    t("buildings.create")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
