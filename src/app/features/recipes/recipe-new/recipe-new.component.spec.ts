import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RecipeNewComponent } from './recipe-new.component';
import { RecipeInputFormComponent } from './recipe-input-form/recipe-input-form.component';
import { setupTestModule, mockRecipeService, mockRecipe } from '../test-setup';
import { 
  findElement, 
  click, 
  expectElement, 
  expectElementNotToExist 
} from '../test-helpers';
import { ParseRecipeCommandModel, ParsedRecipeDto, RecipeDataDto } from '../../../../types/dto';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';

describe('RecipeNewComponent', () => {
  let component: RecipeNewComponent;
  let fixture: ComponentFixture<RecipeNewComponent>;
  let router: Router;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    
    const moduleRef = setupTestModule([
      RecipeNewComponent,
      RecipeInputFormComponent
    ], [
      { provide: MatSnackBar, useValue: snackBarSpy }
    ]);

    await moduleRef.compileComponents();

    fixture = TestBed.createComponent(RecipeNewComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('TC-RECIPE-001: Creating a new recipe', () => {
    const testRecipeText = 'Test Recipe\nIngredients:\n- 100g flour\n- 2 eggs\nSteps:\n1. Mix ingredients\n2. Bake';

    it('should show recipe input form initially', () => {
      fixture.detectChanges();
      expectElement(fixture, 'recipe-input-form');
    });

    it('should show loading state when processing recipe', fakeAsync(() => {
      // Arrange
      fixture.detectChanges();
      const mockParsedRecipe: ParsedRecipeDto = {
        title: 'Test Recipe',
        recipe_data: {
          ingredients: [
            { name: 'flour', amount: 100, unit: 'g' },
            { name: 'eggs', amount: 2, unit: 'pieces' }
          ],
          steps: [
            { description: 'Mix ingredients' },
            { description: 'Bake' }
          ]
        }
      };

      mockRecipeService.parseRecipe.and.returnValue(of(mockParsedRecipe));

      // Act
      component.handleSubmit(testRecipeText);
      fixture.detectChanges();

      // Assert
      expectElementNotToExist(fixture, 'recipe-input-form');
      expectElement(fixture, 'progress-bar');
      expect(component.isProcessing()).toBeTrue();
    }));

    it('should navigate to edit page with parsed recipe on success', fakeAsync(() => {
      // Arrange
      fixture.detectChanges();
      const mockParsedRecipe: ParsedRecipeDto = {
        title: 'Test Recipe',
        recipe_data: {
          ingredients: [
            { name: 'flour', amount: 100, unit: 'g' },
            { name: 'eggs', amount: 2, unit: 'pieces' }
          ],
          steps: [
            { description: 'Mix ingredients' },
            { description: 'Bake' }
          ]
        }
      };

      mockRecipeService.parseRecipe.and.returnValue(of(mockParsedRecipe));

      // Act
      component.handleSubmit(testRecipeText);
      tick();
      fixture.detectChanges();

      // Assert
      expect(router.navigate).toHaveBeenCalledWith(
        ['/recipes', 'edit', 'new'],
        { state: { parsedRecipe: mockParsedRecipe } }
      );
      expect(component.isProcessing()).toBeFalse();
      expect(component.error()).toBeNull();
    }));

    it('should show error message on failure', async () => {
      // Arrange
      fixture.detectChanges();
      const errorMessage = 'Failed to parse recipe';
      mockRecipeService.parseRecipe.and.returnValue(throwError(() => new Error(errorMessage)));

      // Act
      await component.handleSubmit(testRecipeText);
      fixture.detectChanges();

      // Assert - focus on component state
      expect(mockRecipeService.parseRecipe).toHaveBeenCalled();
      expect(component.error()).toBe('Failed to parse recipe');
      expect(component.isProcessing()).toBeFalse();
    });

    it('should handle cancel operation', () => {
      // Arrange
      component.isProcessing.set(true);
      fixture.detectChanges();

      // Act
      component.handleCancel();
      fixture.detectChanges();

      // Assert
      expect(component.isProcessing()).toBeFalse();
      expect(component.error()).toBeNull();
      expectElement(fixture, 'recipe-input-form');
    });
  });
}); 