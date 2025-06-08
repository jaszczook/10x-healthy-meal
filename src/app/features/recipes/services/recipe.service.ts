import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParseRecipeCommandModel, ParsedRecipeDto } from '../../../../types/dto';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  private apiUrl = '/api/recipes';

  parseRecipe(command: ParseRecipeCommandModel): Observable<ParsedRecipeDto> {
    return this.http.post<ParsedRecipeDto>(`${this.apiUrl}/parse`, command).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred while processing the recipe';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid recipe format';
          break;
        case 401:
          errorMessage = 'Please log in to continue';
          break;
        case 408:
          errorMessage = 'Request timed out. Please try again';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
} 