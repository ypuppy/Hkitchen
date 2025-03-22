import { 
  type InventoryItem, 
  type InsertInventoryItem, 
  type Recipe, 
  type InsertRecipe,
  type User, 
  type InsertUser,
  type UserFavorite,
  type InsertUserFavorite,
  users,
  inventoryItems,
  recipes,
  userFavorites
} from "@shared/schema";
import { db } from "./db";
import { and, eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Inventory methods
  getInventoryItems(userId?: number): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: InsertInventoryItem): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  
  // Recipe methods
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number, userId?: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  deleteRecipe(id: number): Promise<boolean>;
  toggleFavoriteRecipe(recipeId: number, userId: number): Promise<Recipe | undefined>;
  getFavoriteRecipes(userId: number): Promise<Recipe[]>;
  
  // Session store
  sessionStore: session.Store;
}

// Session store setup with PostgreSQL
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Inventory methods
  async getInventoryItems(userId?: number): Promise<InventoryItem[]> {
    if (userId) {
      return await db.select().from(inventoryItems).where(eq(inventoryItems.userId, userId));
    }
    return await db.select().from(inventoryItems);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item;
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db.insert(inventoryItems).values(insertItem).returning();
    return item;
  }

  async updateInventoryItem(id: number, updateItem: InsertInventoryItem): Promise<InventoryItem | undefined> {
    const [item] = await db
      .update(inventoryItems)
      .set(updateItem)
      .where(eq(inventoryItems.id, id))
      .returning();
    return item;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
    return true; // Assume successful deletion
  }

  // Recipe methods
  async getRecipes(): Promise<Recipe[]> {
    const allRecipes = await db.select().from(recipes);
    return allRecipes;
  }

  async getRecipe(id: number, userId?: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    
    if (!recipe || !userId) {
      return recipe;
    }
    
    // Check if this is a favorite recipe for the user
    const [favorite] = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.recipeId, id),
          eq(userFavorites.userId, userId)
        )
      );
      
    return {
      ...recipe,
      isFavorite: !!favorite
    };
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const [recipe] = await db.insert(recipes).values(insertRecipe).returning();
    return {
      ...recipe,
      isFavorite: false
    };
  }

  async deleteRecipe(id: number): Promise<boolean> {
    // First delete any favorite entries for this recipe
    await db.delete(userFavorites).where(eq(userFavorites.recipeId, id));
    
    // Then delete the recipe
    await db.delete(recipes).where(eq(recipes.id, id));
    return true; // Assume successful deletion
  }

  async toggleFavoriteRecipe(recipeId: number, userId: number): Promise<Recipe | undefined> {
    // Check if recipe exists
    const recipe = await this.getRecipe(recipeId, userId);
    if (!recipe) {
      return undefined;
    }
    
    // Check if it's already a favorite
    const [existingFavorite] = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.recipeId, recipeId),
          eq(userFavorites.userId, userId)
        )
      );
      
    if (existingFavorite) {
      // Remove from favorites
      await db
        .delete(userFavorites)
        .where(
          and(
            eq(userFavorites.recipeId, recipeId),
            eq(userFavorites.userId, userId)
          )
        );
        
      return {
        ...recipe,
        isFavorite: false
      };
    } else {
      // Add to favorites
      await db
        .insert(userFavorites)
        .values({
          userId,
          recipeId
        });
        
      return {
        ...recipe,
        isFavorite: true
      };
    }
  }

  async getFavoriteRecipes(userId: number): Promise<Recipe[]> {
    // Get all favorite recipe IDs for the user
    const favorites = await db
      .select({
        recipeId: userFavorites.recipeId
      })
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId));
      
    if (favorites.length === 0) {
      return [];
    }
    
    // Get all recipes that are favorites
    const recipeIds = favorites.map(f => f.recipeId);
    
    // This is a simplified approach - in a real app, you might want to use a SQL IN clause
    const favoriteRecipes: Recipe[] = [];
    
    for (const id of recipeIds) {
      const recipe = await this.getRecipe(id);
      if (recipe) {
        favoriteRecipes.push({
          ...recipe,
          isFavorite: true
        });
      }
    }
    
    return favoriteRecipes;
  }
}

export const storage = new DatabaseStorage();
