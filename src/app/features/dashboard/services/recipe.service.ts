import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe, RecipeListResponse } from '../types';

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
  private readonly apiUrl = 'http://localhost:3000/api/recipes';

  constructor(private readonly http: HttpClient) {}

  getRecipes(params: GetRecipesParams): Observable<RecipeListResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('page_size', params.pageSize.toString())
      .set('sort_by', params.sortBy)
      .set('sort_direction', params.sortDirection);

    if (params.searchTerm) {
      httpParams = httpParams.set('search', params.searchTerm);
    }

    return this.http.get<RecipeListResponse>(this.apiUrl, { params: httpParams });
  }

  getRecipe(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }

  createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Observable<Recipe> {
    return this.http.post<Recipe>(this.apiUrl, recipe);
  }

  updateRecipe(id: string, recipe: Partial<Recipe>): Observable<Recipe> {
    return this.http.patch<Recipe>(`${this.apiUrl}/${id}`, recipe);
  }

  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 