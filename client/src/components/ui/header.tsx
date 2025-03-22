import { ChefHat, Utensils, Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg shadow-sm p-4 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="relative mr-3">
            <ChefHat className="h-10 w-10 text-primary" />
            <Utensils className="h-5 w-5 text-primary-500 absolute -bottom-1 -right-1" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              Kitchen Companion
            </h1>
            <p className="text-xs text-neutral-500">Your smart recipe assistant</p>
          </div>
        </div>
        <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm border border-emerald-100">
          <Sparkles className="h-4 w-4 text-amber-400 mr-1" />
          <p className="text-sm text-neutral-600">Powered by OpenAI GPT-4o</p>
        </div>
      </div>
    </header>
  );
}
