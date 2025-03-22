import { pgTable, text, serial, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Inventory items schema
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).pick({
  name: true,
  quantity: true,
  unit: true,
  userId: true,
});

export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;

// Recipe schema
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  cookTime: integer("cook_time").notNull(),
  difficulty: text("difficulty").notNull(),
  servings: integer("servings").notNull(),
  instructions: text("instructions").notNull(),
  ingredients: text("ingredients").notNull(), // Stored as JSON string
  matchedIngredients: integer("matched_ingredients").notNull(),
  totalIngredients: integer("total_ingredients").notNull(),
  tags: text("tags").array(), // Store categories like "Quick", "Vegetarian", etc.
});

// User favorite recipes junction table
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id),
});

export const insertRecipeSchema = createInsertSchema(recipes).pick({
  title: true,
  description: true,
  imageUrl: true,
  cookTime: true,
  difficulty: true,
  servings: true,
  instructions: true,
  ingredients: true,
  matchedIngredients: true,
  totalIngredients: true,
  tags: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).pick({
  userId: true,
  recipeId: true,
});

export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
// Recipe type with an additional isFavorite field for the frontend
export type Recipe = typeof recipes.$inferSelect & { isFavorite?: boolean };

// Extended schema for inventory form validation
export const inventoryFormSchema = insertInventoryItemSchema.extend({
  name: z.string().min(1, "Item name is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0")
    .transform(val => val.toString()), // Convert number to string for storage
  unit: z.string().min(1, "Unit is required"),
});

// Recipe ingredient type for structured data
export const recipeIngredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unit: z.string(),
  inInventory: z.boolean().default(false),
});

export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;

// Recipe instruction type for structured data
export const recipeInstructionSchema = z.object({
  step: z.number(),
  instruction: z.string(),
});

export type RecipeInstruction = z.infer<typeof recipeInstructionSchema>;
