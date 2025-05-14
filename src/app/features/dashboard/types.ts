import { RecipeListItemDto, RecipesListResponseDto } from '../../../types/dto';

export interface SortOption {
  value: string;
  viewValue: string;
}

export interface FilterChangePayload {
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  length: number;
}

export interface Recipe {
  id: string;
  title: string;
  total_calories: number | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeListResponse {
  items: Recipe[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardPageViewModel {
  recipesListResponse: RecipesListResponseDto | null;
  recipes: RecipeListItemDto[];
  totalRecipes: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
}

export interface GetRecipesApiParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
} 