import axios from "axios";

import {
  CommonIngredient,
  IngredientFilter,
  ProlificAuthor,
  Recipe,
  RecipeByAuthor,
  RecipeDetails,
} from "../interfaces/interfaces";

import {
  INGREDIENTS_URL,
  RECIPES_BY_AUTHOR_URL,
  RECIPES_URL,
  RECIPE_DETAILS_URL,
  TOP_5_MOST_COMMON_INGREDIENTS_URL,
  TOP_5_MOST_COMPLEX_RECIPES_URL,
  TOP_5_MOST_PROLIFIC_AUTHORS_URL,
  TOTAL_PAGES_BY_AUTHOR_URL,
} from "../constants/constants";

export const fetchTop5MostCommonIngredients = async (): Promise<CommonIngredient[]> => {
  const response = await axios.get<CommonIngredient[]>(TOP_5_MOST_COMMON_INGREDIENTS_URL);
  return response.data;
};

export const fetchTop5MostProlificAuthors = async (): Promise<ProlificAuthor[]> => {
  const response = await axios.get<ProlificAuthor[]>(TOP_5_MOST_PROLIFIC_AUTHORS_URL);
  return response.data;
};

export const fetchTop5MostComplexRecipes = async (): Promise<Recipe[]> => {
  const response = await axios.get<Recipe[]>(TOP_5_MOST_COMPLEX_RECIPES_URL);
  return response.data;
};

export const fetchIngredients = async (): Promise<IngredientFilter[]> => {
  const response = await axios.get<IngredientFilter[]>(INGREDIENTS_URL);
  return response.data;
};

export const fetchRecipes = async (
  pageNumber: number,
  sortBy: string,
  sortOrder: string,
  searchQuery: string,
  ingredientFilters: string[]
): Promise<Recipe[]> => {
  const baseUrl_ = RECIPES_URL;
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    sortBy,
    sortOrder,
    ...(searchQuery && { searchQuery }),
    ...(ingredientFilters.length > 0 && {
      ingredientFilters: ingredientFilters.join(","),
    }),
  }).toString();
  const fullUrl = `${baseUrl_}?${params}`;
  const response = await axios.get<Recipe[]>(fullUrl);
  return response.data;
};

export const fetchTotalPagesByAuthor = async (authorName: string): Promise<number> => {
  const response = await axios.get<number>(TOTAL_PAGES_BY_AUTHOR_URL(authorName));
  return response.data;
};

export const fetchRecipeDetails = async (recipeId: string): Promise<RecipeDetails> => {
  const response = await axios.get<RecipeDetails>(RECIPE_DETAILS_URL(recipeId));
  return response.data;
};

export const fetchRecipesByAuthor = async (
  authorName: string,
  authorModalCurrentPage: number
): Promise<RecipeByAuthor[]> => {
  const response = await axios.get<RecipeByAuthor[]>(RECIPES_BY_AUTHOR_URL(authorName, authorModalCurrentPage));
  return response.data;
};
