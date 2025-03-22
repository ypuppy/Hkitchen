import OpenAI from "openai";
import { z } from "zod";
import { type InventoryItem } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface Recipe {
  title: string;
  description: string;
  cookTime: number;
  difficulty: string;
  servings: number;
  ingredients: {
    name: string;
    quantity: string;
    unit: string;
    inInventory: boolean;
  }[];
  instructions: {
    step: number;
    instruction: string;
  }[];
  matchedIngredients: number;
  totalIngredients: number;
  tags: string[];
}

// Define the schema for the recipe returned by OpenAI
const RecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  cookTime: z.number(),
  difficulty: z.string(),
  servings: z.number(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
      // Make unit optional with a default empty string
      unit: z.string().nullable().transform(val => val || ""),
      inInventory: z.boolean(),
    })
  ),
  instructions: z.array(
    z.object({
      step: z.number(),
      instruction: z.string(),
    })
  ),
  matchedIngredients: z.number(),
  totalIngredients: z.number(),
  tags: z.array(z.string()),
});

// Define the schema for the array of recipes returned by OpenAI
const RecipesResponseSchema = z.array(RecipeSchema);

export async function generateRecipes(inventoryItems: InventoryItem[]): Promise<Recipe[]> {
  try {
    // Format inventory items for the prompt
    const formattedItems = inventoryItems.map(item => 
      `${item.name}: ${item.quantity} ${item.unit}`
    ).join("\n");
    
    // Create the prompt for OpenAI
    const prompt = `
      You are a professional chef specializing in creating recipes based on available ingredients.
      
      I have the following ingredients in my kitchen inventory:
      ${formattedItems}
      
      Please suggest 3 different recipes I can make with these ingredients. Some ingredients might be missing, but try to maximize the use of what I have.
      
      For each recipe, provide:
      1. A title
      2. A brief description
      3. Cooking time in minutes
      4. Difficulty level (Easy, Medium, Hard)
      5. Number of servings
      6. A list of all ingredients needed with quantities and units, and whether I have them in my inventory
      7. Step-by-step instructions
      8. Number of ingredients from my inventory used
      9. Total number of ingredients needed
      10. Relevant tags (like "Quick", "Vegetarian", "Low Carb", etc.)
      
      IMPORTANT: Format your response as a JSON object with a "recipes" array containing recipe objects with the following structure:
      
      {
        "recipes": [
          {
            "title": "Recipe Title",
            "description": "Brief description",
            "cookTime": 30,
            "difficulty": "Easy",
            "servings": 4,
            "ingredients": [
              {
                "name": "ingredient name",
                "quantity": "amount as string",
                "unit": "unit of measurement or empty string if not applicable",
                "inInventory": true
              }
            ],
            "instructions": [
              {
                "step": 1,
                "instruction": "First step instruction"
              }
            ],
            "matchedIngredients": 5,
            "totalIngredients": 8,
            "tags": ["Quick", "Easy"]
          }
        ]
      }
      
      IMPORTANT: Always provide a "unit" property for each ingredient, using "" (empty string) if no unit is needed.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse the JSON from the response content
    const parsedContent = JSON.parse(content);
    
    // Make sure "recipes" property exists in the response
    const recipesArray = parsedContent.recipes || parsedContent;
    
    // Validate against our schema
    const validatedRecipes = RecipesResponseSchema.parse(recipesArray);
    
    return validatedRecipes;
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error(`Failed to generate recipes: ${error instanceof Error ? error.message : String(error)}`);
  }
}
