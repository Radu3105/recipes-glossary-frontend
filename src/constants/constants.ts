// Base URL
export const BASE_URL = 'https://recipes-glossary-a24515c9460c.herokuapp.com';

// Endpoints
export const TOP_5_MOST_COMMON_INGREDIENTS_URL = `${BASE_URL}/Recipes/top-5-most-common-ingredients`;
export const TOP_5_MOST_PROLIFIC_AUTHORS_URL = `${BASE_URL}/Recipes/top-5-most-prolific-authors`;
export const TOP_5_MOST_COMPLEX_RECIPES_URL = `${BASE_URL}/Recipes/top-5-most-complex-recipes`;
export const INGREDIENTS_URL = `${BASE_URL}/Ingredients`;
export const RECIPES_URL = `${BASE_URL}/Recipes`;
export const TOTAL_PAGES_BY_AUTHOR_URL = (authorName: string) => `${BASE_URL}/Recipes/count/${authorName}`;
export const RECIPE_DETAILS_URL = (recipeId: string) => `${BASE_URL}/Recipes/id/${recipeId}`;
export const RECIPES_BY_AUTHOR_URL = (authorName: string, page: number) => `${BASE_URL}/Recipes/${authorName}/${page}`;

// Pagination
export const RECIPES_PER_PAGE = 10;
