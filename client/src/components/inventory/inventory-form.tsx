import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Plus, X, Loader2, UtensilsCrossed, Apple, Beef, Egg, Milk, Carrot, Fish } from "lucide-react";

interface InventoryFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

// Common food items for quick selection
interface QuickItem {
  name: string;
  icon: React.ReactNode;
}

export default function InventoryForm({ onCancel, onSuccess }: InventoryFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("pcs");
  const [errors, setErrors] = useState({
    name: "",
    quantity: "",
    unit: ""
  });
  
  const quickItems: QuickItem[] = [
    { name: "Apple", icon: <Apple className="h-4 w-4" /> },
    { name: "Beef", icon: <Beef className="h-4 w-4" /> },
    { name: "Carrot", icon: <Carrot className="h-4 w-4" /> },
    { name: "Egg", icon: <Egg className="h-4 w-4" /> },
    { name: "Milk", icon: <Milk className="h-4 w-4" /> },
    { name: "Fish", icon: <Fish className="h-4 w-4" /> },
  ];
  
  const selectQuickItem = (itemName: string) => {
    setName(itemName);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: "",
      quantity: "",
      unit: ""
    };
    
    if (!name.trim()) {
      newErrors.name = "Item name is required";
      valid = false;
    }
    
    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
      valid = false;
    }
    
    if (!unit) {
      newErrors.unit = "Unit is required";
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("🚨 Form submitted with:", { name, quantity, unit });
    
    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }
    
    if (isSubmitting) {
      console.log("🚫 Already submitting, skipping");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!user?.id) {
        console.error("❌ User ID not available");
        toast({
          title: "Error",
          description: "You must be logged in to add items to your inventory",
          variant: "destructive",
        });
        return;
      }
      
      const payload = {
        name,
        quantity,
        unit,
        userId: user.id
      };
      
      console.log("📤 Sending inventory data to API:", payload);
      
      // Direct fetch call to the API
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // Include cookies for session auth
      });
      
      console.log("📥 API Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error response:", errorText);
        let errorMessage = "Failed to add item";
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log("✅ Item added successfully:", result);
      
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      toast({
        title: "Item Added",
        description: "The item has been added to your inventory.",
      });
      
      // Reset form and notify parent component
      setName("");
      setQuantity("1");
      setUnit("pcs");
      onSuccess();
    } catch (error) {
      console.error("❌ Error adding inventory item:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Item Name
            </label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tomatoes" 
              className="bg-white border-neutral-200 focus:border-primary focus:ring-primary"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Quantity
            </label>
            <div className="flex shadow-sm">
              <Input 
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => {
                  console.log("Input value changed:", e.target.value);
                  setQuantity(e.target.value);
                }}
                className="rounded-r-none bg-white border-neutral-200"
              />
              
              <div className="w-1/2">
                <Select 
                  value={unit}
                  onValueChange={setUnit}
                >
                  <SelectTrigger className="rounded-l-none border-l-0 bg-neutral-50">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
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
              </div>
            </div>
            {errors.quantity && (
              <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
            )}
          </div>
        </div>
        
        <div className="pt-2 border-t border-neutral-200">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
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
    </div>
  );
}
