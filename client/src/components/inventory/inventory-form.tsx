import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inventoryFormSchema } from "@shared/schema";
import { Plus, X, Loader2, UtensilsCrossed, Apple, Beef, Egg, Milk, Carrot, Fish } from "lucide-react";

interface InventoryFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

type FormValues = z.infer<typeof inventoryFormSchema>;

// Common food items for quick selection
interface QuickItem {
  name: string;
  icon: React.ReactNode;
}

export default function InventoryForm({ onCancel, onSuccess }: InventoryFormProps) {
  const { toast } = useToast();
  
  const quickItems: QuickItem[] = [
    { name: "Apple", icon: <Apple className="h-4 w-4" /> },
    { name: "Beef", icon: <Beef className="h-4 w-4" /> },
    { name: "Carrot", icon: <Carrot className="h-4 w-4" /> },
    { name: "Egg", icon: <Egg className="h-4 w-4" /> },
    { name: "Milk", icon: <Milk className="h-4 w-4" /> },
    { name: "Fish", icon: <Fish className="h-4 w-4" /> },
  ];
  
  const form = useForm<FormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      quantity: "1", // Using string since the schema expects a string
      unit: "pcs",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/inventory", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Item Added",
        description: "The item has been added to your inventory.",
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate(data);
  };
  
  const selectQuickItem = (itemName: string) => {
    form.setValue("name", itemName);
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="bg-primary text-white p-2 rounded-lg mr-3">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-neutral-800">Add to Pantry</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          className="rounded-full hover:bg-red-100 hover:text-red-600"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Quick add section */}
      <div className="mb-5">
        <p className="text-xs font-medium text-neutral-500 mb-2">Quick Add</p>
        <div className="flex flex-wrap gap-2">
          {quickItems.map((item, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              size="sm"
              className="bg-white border-neutral-200 hover:border-primary hover:bg-primary/5"
              onClick={() => selectQuickItem(item.name)}
            >
              {item.icon}
              <span className="ml-1">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-700">Item Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Tomatoes" 
                      className="bg-white border-neutral-200 focus:border-primary focus:ring-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col space-y-2">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700">Quantity</FormLabel>
                    <div className="flex shadow-sm">
                      <FormControl>
                        <Input 
                          type="number"
                          min="0.01"
                          step="0.01"
                          className="rounded-r-none bg-white border-neutral-200"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      
                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem className="w-1/2">
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-l-none border-l-0 bg-neutral-50">
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pcs">pcs</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="lbs">lbs</SelectItem>
                                <SelectItem value="oz">oz</SelectItem>
                                <SelectItem value="cups">cups</SelectItem>
                                <SelectItem value="tbsp">tbsp</SelectItem>
                                <SelectItem value="tsp">tsp</SelectItem>
                                <SelectItem value="ml">ml</SelectItem>
                                <SelectItem value="l">l</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="pt-2 border-t border-neutral-200">
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Inventory
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
