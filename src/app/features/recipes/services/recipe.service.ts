import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParseRecipeCommandModel, ParsedRecipeDto, RecipeDetailDto } from '../../../../types/dto';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/recipes';

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

  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
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