import { useState } from "react";
import { AppLayout } from "../App";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, generatePurchaseOrderNumber } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Plus, Package, ShoppingCart, ArrowDown, Trash, Edit } from "lucide-react";
import { format } from "date-fns";

// Form schema for new purchase order
const purchaseOrderSchema = z.object({
  poNumber: z.string().min(1, "PO number is required"),
  notes: z.string().optional(),
});

// Form schema for purchase order item
const purchaseOrderItemSchema = z.object({
  materialId: z.string().min(1, "Material is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0.01, "Unit price must be greater than 0"),
});

export default function Purchasing() {
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch purchase orders
  const { data: purchaseOrders = [], isLoading: isLoadingPOs } = useQuery({
    queryKey: ["/api/purchase-orders"],
  });

  // Fetch materials
  const { data: materials = [], isLoading: isLoadingMaterials } = useQuery({
    queryKey: ["/api/materials"],
  });

  // Filter purchase orders
  const filteredPOs = filterStatus 
    ? purchaseOrders.filter((po: any) => po.status === filterStatus)
    : purchaseOrders;

  // Purchase order form
  const poForm = useForm<z.infer<typeof purchaseOrderSchema>>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      poNumber: generatePurchaseOrderNumber(),
      notes: "",
    },
  });

  // Purchase order item form
  const poItemForm = useForm<z.infer<typeof purchaseOrderItemSchema>>({
    resolver: zodResolver(purchaseOrderItemSchema),
    defaultValues: {
      materialId: "",
      quantity: 1,
      unitPrice: 0,
    },
  });

  // Watch material ID to update unit price
  const watchedMaterialId = poItemForm.watch("materialId");
  const watchedQuantity = poItemForm.watch("quantity");

  // Create purchase order mutation
  const createPOMutation = useMutation({
    mutationFn: async (data: z.infer<typeof purchaseOrderSchema>) => {
      return apiRequest("POST", "/api/purchase-orders", {
        ...data,
        createdBy: 6, // Hardcoded for demo (ID of purchasing agent)
        status: "draft",
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({
        title: "Purchase Order Created",
        description: "The purchase order has been created successfully.",
      });
      setIsCreatingPO(false);
      setSelectedPO(response);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create purchase order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add item to purchase order mutation
  const addPOItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof purchaseOrderItemSchema> & { purchaseOrderId: number }) => {
      const totalPrice = data.quantity * data.unitPrice;
      return apiRequest("POST", `/api/purchase-orders/${data.purchaseOrderId}/items`, {
        materialId: parseInt(data.materialId),
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalPrice,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({
        title: "Item Added",
        description: "The item has been added to the purchase order.",
      });
      setIsAddingItem(false);
      poItemForm.reset({
        materialId: "",
        quantity: 1,
        unitPrice: 0,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update purchase order status mutation
  const updatePOStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/purchase-orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({
        title: "Status Updated",
        description: "The purchase order status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle create PO form submission
  const handleCreatePO = (data: z.infer<typeof purchaseOrderSchema>) => {
    createPOMutation.mutate(data);
  };

  // Handle add item form submission
  const handleAddItem = (data: z.infer<typeof purchaseOrderItemSchema>) => {
    if (!selectedPO) return;
    
    addPOItemMutation.mutate({
      ...data,
      purchaseOrderId: selectedPO.id,
    });
  };

  // Handle material selection to prefill price
  const handleMaterialChange = (value: string) => {
    const material = materials.find((m: any) => m.id.toString() === value);
    if (material) {
      // Assume a default price based on material for demo
      const estimatedPrice = material.id * 5.25; // Just a demo calculation
      poItemForm.setValue("unitPrice", parseFloat(estimatedPrice.toFixed(2)));
    }
  };

  // Handle status change
  const handleStatusChange = (poId: number, newStatus: string) => {
    updatePOStatusMutation.mutate({ id: poId, status: newStatus });
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Draft</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Submitted</Badge>;
      case 'received':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Received</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-bold">Purchasing</h1>
          <Button onClick={() => setIsCreatingPO(true)} className="flex items-center gap-1">
            <ShoppingCart className="h-4 w-4" />
            New Purchase Order
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Materials Inventory
              </CardTitle>
              <CardDescription>Current inventory levels</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMaterials ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-2">
                  {materials.slice(0, 5).map((material: any) => (
                    <div key={material.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <p className="text-xs text-neutral-500">
                          {material.quantity} {material.unit}{material.quantity !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={material.quantity > 10 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {material.quantity > 10 ? "In Stock" : "Low Stock"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">View All Materials</Button>
            </CardFooter>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Purchase Orders</CardTitle>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>Manage purchase orders</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPOs ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPOs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-neutral-500">
                            No purchase orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPOs.map((po: any) => (
                          <TableRow key={po.id}>
                            <TableCell className="font-medium">{po.poNumber}</TableCell>
                            <TableCell>
                              {po.createdByUser?.name || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {format(new Date(po.createdAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(po.totalAmount || 0)}
                            </TableCell>
                            <TableCell>{getStatusBadge(po.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary-600 hover:text-primary-900"
                                onClick={() => {
                                  setSelectedPO(po);
                                }}
                              >
                                <Edit className="h-4 w-4" />
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

        {selectedPO && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Purchase Order: {selectedPO.poNumber}
                </CardTitle>
                {getStatusBadge(selectedPO.status)}
              </div>
              <CardDescription>
                Created on {format(new Date(selectedPO.createdAt), "MMMM d, yyyy")} by {selectedPO.createdByUser?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPO.notes && (
                <div className="p-3 bg-neutral-50 rounded-md">
                  <p className="text-sm font-medium mb-1">Notes:</p>
                  <p className="text-sm text-neutral-600">{selectedPO.notes}</p>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Items</h3>
                  {selectedPO.status === 'draft' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setIsAddingItem(true)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Item
                    </Button>
                  )}
                </div>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        {selectedPO.status === 'draft' && <TableHead></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPO.items && selectedPO.items.length > 0 ? (
                        selectedPO.items.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.material?.name || "Unknown Material"}</TableCell>
                            <TableCell className="text-right">
                              {item.quantity} {item.material?.unit}{item.quantity !== 1 ? 's' : ''}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                            {selectedPO.status === 'draft' && (
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={selectedPO.status === 'draft' ? 5 : 4} className="text-center py-4 text-neutral-500">
                            No items added to this purchase order
                          </TableCell>
                        </TableRow>
                      )}
                      {selectedPO.items && selectedPO.items.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={2}></TableCell>
                          <TableCell className="text-right font-medium">Total:</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(selectedPO.totalAmount || 0)}</TableCell>
                          {selectedPO.status === 'draft' && <TableCell></TableCell>}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t p-4">
              <Button variant="outline" onClick={() => setSelectedPO(null)}>Close</Button>
              <div className="space-x-2">
                {selectedPO.status === 'draft' && (
                  <Button 
                    onClick={() => handleStatusChange(selectedPO.id, 'submitted')}
                    disabled={!selectedPO.items || selectedPO.items.length === 0}
                  >
                    Submit Order
                  </Button>
                )}
                {selectedPO.status === 'submitted' && (
                  <Button 
                    onClick={() => handleStatusChange(selectedPO.id, 'received')}
                  >
                    Mark as Received
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Create Purchase Order Dialog */}
      <Dialog open={isCreatingPO} onOpenChange={setIsCreatingPO}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Create a new purchase order to request materials
            </DialogDescription>
          </DialogHeader>
          
          <Form {...poForm}>
            <form onSubmit={poForm.handleSubmit(handleCreatePO)} className="space-y-4">
              <FormField
                control={poForm.control}
                name="poNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={poForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Add any notes or special instructions" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreatingPO(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPOMutation.isPending}
                >
                  {createPOMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Purchase Order'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to PO</DialogTitle>
            <DialogDescription>
              Add materials to purchase order {selectedPO?.poNumber}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...poItemForm}>
            <form onSubmit={poItemForm.handleSubmit(handleAddItem)} className="space-y-4">
              <FormField
                control={poItemForm.control}
                name="materialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleMaterialChange(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materials.map((material: any) => (
                          <SelectItem key={material.id} value={material.id.toString()}>
                            {material.name} ({material.quantity} in stock)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={poItemForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={poItemForm.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price (MXN)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0.01" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="p-3 bg-neutral-50 rounded-md flex justify-between items-center">
                <span className="text-sm font-medium">Estimated Total:</span>
                <span className="text-sm font-medium">
                  {formatCurrency((poItemForm.getValues("quantity") || 0) * (poItemForm.getValues("unitPrice") || 0))}
                </span>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingItem(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addPOItemMutation.isPending}
                >
                  {addPOItemMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Item'
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
