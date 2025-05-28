import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParseRecipeCommandModel, ParsedRecipeDto, RecipeDetailDto, ValidationResultDto, CreateRecipeCommandModel } from '../../../../types/dto';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  private apiUrl = `/api/recipes`;

  parseRecipe(command: ParseRecipeCommandModel): Observable<ParsedRecipeDto> {
    return this.http.post<ParsedRecipeDto>(`${this.apiUrl}/parse`, command).pipe(
      catchError(this.handleError)
    );
  }

  getRecipe(id: string): Observable<RecipeDetailDto> {
    return this.http.get<RecipeDetailDto>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createRecipe(recipe: CreateRecipeCommandModel): Observable<RecipeDetailDto> {
    return this.http.post<RecipeDetailDto>(this.apiUrl, recipe).pipe(
      catchError(this.handleError)
    );
  }

  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateRecipe(id: string, recipe: Partial<RecipeDetailDto>): Observable<RecipeDetailDto> {
    return this.http.put<RecipeDetailDto>(`${this.apiUrl}/${id}`, recipe);
  }

  validateRecipe(id: string, recipe: Partial<RecipeDetailDto>): Observable<ValidationResultDto> {
    return this.http.post<ValidationResultDto>(`${this.apiUrl}/${id}/validate`, recipe);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred while processing the recipe';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid recipe format';
          break;
        case 401:
          errorMessage = 'Please log in to continue';
          break;
        case 404:
          errorMessage = 'Recipe not found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        default:
          errorMessage = error.error?.error || error.message;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
} 