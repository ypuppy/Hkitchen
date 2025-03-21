import { InventoryItem } from "@shared/schema";

interface InventoryItemProps {
  item: InventoryItem;
  onEdit: () => void;
  onDelete: () => void;
}

export default function InventoryItemComponent({ item, onEdit, onDelete }: InventoryItemProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-md p-3 flex justify-between items-center fade-in">
      <div className="w-1/2">
        <span className="font-medium text-neutral-800">{item.name}</span>
      </div>
      <div className="w-1/4 text-center">
        <span>{item.quantity.toString()}</span>
        <span className="text-neutral-500 ml-1">{item.unit}</span>
      </div>
      <div className="w-1/4 flex justify-end space-x-1">
        <button 
          className="text-neutral-500 hover:text-primary p-1"
          onClick={onEdit}
          aria-label={`Edit ${item.name}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button 
          className="text-neutral-500 hover:text-red-500 p-1"
          onClick={onDelete}
          aria-label={`Delete ${item.name}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
