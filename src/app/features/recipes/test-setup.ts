import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { RecipeService } from './services/recipe.service';

// Mock services
export const mockRecipeService = {
  createRecipe: jasmine.createSpy('createRecipe').and.returnValue(of({})),
  getRecipe: jasmine.createSpy('getRecipe').and.returnValue(of({})),
  updateRecipe: jasmine.createSpy('updateRecipe').and.returnValue(of({})),
  deleteRecipe: jasmine.createSpy('deleteRecipe').and.returnValue(of(void 0)),
  parseRecipe: jasmine.createSpy('parseRecipe').and.returnValue(of({}))
};

export const mockAuthService = {
  getCurrentUser: jasmine.createSpy('getCurrentUser'),
  isAuthenticated: jasmine.createSpy('isAuthenticated')
};

// Test data
export const mockRecipe = {
  id: '1',
  title: 'Test Recipe',
  description: 'Test Description',
  ingredients: [
    { name: 'Ingredient 1', amount: 100, unit: 'g' },
    { name: 'Ingredient 2', amount: 2, unit: 'tbsp' }
  ],
  steps: [
    'Step 1',
    'Step 2'
  ],
  cookingTime: 30,
  difficulty: 'medium',
  servings: 4,
  userId: 'user123'
};

// Common test module setup
export function setupTestModule(imports: any[] = [], providers: any[] = []) {
  return TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
      NoopAnimationsModule,
      ReactiveFormsModule,
      MatSnackBarModule,
      MatDialogModule,
      HttpClientTestingModule,
      ...imports
    ],
    providers: [
      { provide: RecipeService, useValue: mockRecipeService },
      { provide: 'AuthService', useValue: mockAuthService },
      ...providers
    ]
  });
} 