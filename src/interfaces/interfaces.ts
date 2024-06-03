export interface Recipe {
    recipeId: string;
    recipeName: string;
    authorName: string;
    ingredientCount: number;
    skillLevel: string;
}

export interface RecipeByAuthor {
    recipeId: string;
    recipeName: string;
}

export interface RecipeDetails {
    id: string;
    name: string;
    description: string;
    cookingTime: number;
    preparationTime: number;
    ingredients: string[];
    collections: string[];
    keywords: string[];
    dietTypes: string[];
    similarRecipes: SimilarRecipe[];
}

export interface SimilarRecipe {
    recipeId: string;
    recipeName: string;
    similarityScore: number;
}

export interface SortConfig {
    sortBy: string;
    order: string;
    searchQuery: string;
    ingredientFilters: string[];
}

export interface CommonIngredient {
    name: string;
    recipeCount: number;
}

export interface ProlificAuthor {
    authorName: string;
    recipeCount: number;
}

export interface IngredientFilter {
    name: string;
} 