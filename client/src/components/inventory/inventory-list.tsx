import { InventoryItem } from "@shared/schema";
import InventoryItemComponent from "./inventory-item";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryListProps {
  items: InventoryItem[];
  isLoading: boolean;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
}

export default function InventoryList({ items, isLoading, onEdit, onDelete }: InventoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center mb-2 text-sm font-medium text-neutral-500 border-b border-neutral-200 pb-2">
          <span className="w-1/2">Item</span>
          <span className="w-1/4 text-center">Quantity</span>
          <span className="w-1/4 text-right">Actions</span>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-white border border-neutral-200 rounded-md p-3 flex justify-between items-center">
            <div className="w-1/2">
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="w-1/4 text-center">
              <Skeleton className="h-5 w-16 mx-auto" />
            </div>
            <div className="w-1/4 flex justify-end space-x-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div id="emptyInventory" className="text-center py-8 text-neutral-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
          <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
        </svg>
        <p className="text-lg font-medium">Your inventory is empty</p>
        <p className="text-sm mt-1">Add some ingredients to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2 text-sm font-medium text-neutral-500 border-b border-neutral-200 pb-2">
        <span className="w-1/2">Item</span>
        <span className="w-1/4 text-center">Quantity</span>
        <span className="w-1/4 text-right">Actions</span>
      </div>
      
      {items.map((item) => (
        <InventoryItemComponent
          key={item.id}
          item={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </div>
  );
}
