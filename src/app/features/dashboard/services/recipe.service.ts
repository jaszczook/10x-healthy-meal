import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecipeListItemDto, RecipesListResponseDto } from '../../../../types/dto';

export interface GetRecipesParams {
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly apiUrl = 'api/recipes';

  constructor(private readonly http: HttpClient) {}

  getRecipes(params: GetRecipesParams): Observable<RecipesListResponseDto> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('page_size', params.pageSize.toString())
      .set('sort_by', params.sortBy)
      .set('sort_direction', params.sortDirection);

    if (params.searchTerm) {
      httpParams = httpParams.set('search', params.searchTerm);
    }

    return this.http.get<RecipesListResponseDto>(this.apiUrl, { params: httpParams });
  }

  getRecipe(id: string): Observable<RecipeListItemDto> {
    return this.http.get<RecipeListItemDto>(`${this.apiUrl}/${id}`);
  }

  createRecipe(recipe: Omit<RecipeListItemDto, 'id' | 'createdAt' | 'updatedAt'>): Observable<RecipeListItemDto> {
    return this.http.post<RecipeListItemDto>(this.apiUrl, recipe);
  }

  updateRecipe(id: string, recipe: Partial<RecipeListItemDto>): Observable<RecipeListItemDto> {
    return this.http.patch<RecipeListItemDto>(`${this.apiUrl}/${id}`, recipe);
  }

  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 