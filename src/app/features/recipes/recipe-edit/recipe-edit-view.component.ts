import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeDetailDto, RecipeFormViewModel, ValidationResultDto, UserPreferencesDto, RecipeSummaryViewModel, IngredientViewModel, StepViewModel, RecipeDataDto, ParsedRecipeDto } from '../../../../types/dto';
import { RecipeFormComponent } from './recipe-form/recipe-form.component';
import { RecipeSummaryComponent } from './recipe-summary/recipe-summary.component';
import { RecipeService } from '../services/recipe.service';
import { PreferencesService } from '../../preferences/services/preferences.service';

@Component({
  selector: 'app-recipe-edit-view',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    RecipeFormComponent,
    RecipeSummaryComponent
  ],
  templateUrl: './recipe-edit-view.component.html',
  styleUrl: './recipe-edit-view.component.scss'
})
export class RecipeEditViewComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private recipeService = inject(RecipeService);
  private preferencesService = inject(PreferencesService);

  // State signals
  formData = signal<RecipeFormViewModel>({
    title: '',
    ingredients: [],
    steps: [],
    notes: '',
    calories: 0
  });
  
  userPreferences = signal<UserPreferencesDto>({
    allergies: null,
    intolerances: null,
    target_calories: null,
    created_at: null,
    updated_at: null
  });

  summary = signal<RecipeSummaryViewModel>({
    totalCalories: 0,
    ingredients: []
  });

  isEditMode = signal(true);
  isLoading = signal(false);
  recipeId = signal<string | null>(null);

  ngOnInit(): void {
    this.recipeId.set(this.route.snapshot.paramMap.get('id'));
    this.loadUserPreferences();
    
    // Check if we have a parsed recipe in the router state
    const parsedRecipe = history.state?.parsedRecipe;
    if (parsedRecipe) {
      this.handleParsedRecipe(parsedRecipe);
    } else if (this.recipeId()) {
      this.loadRecipe();
    }
  }

  private loadUserPreferences(): void {
    this.preferencesService.getCurrentUserPreferences().subscribe({
      next: (preferences) => {
        this.userPreferences.set(preferences);
      },
      error: (error) => {
        console.error('Failed to load user preferences:', error);
        this.snackBar.open('Failed to load user preferences', 'Close', { duration: 3000 });
      }
    });
  }

  private loadRecipe(): void {
    if (!this.recipeId()) return;
    
    this.isLoading.set(true);
    this.recipeService.getRecipe(this.recipeId()!).subscribe({
      next: (recipe) => {
        // Convert DTO to ViewModel
        const ingredients: IngredientViewModel[] = recipe.recipe_data.ingredients.map(ing => ({
          ...ing,
          isAllergen: false // Default value, can be updated based on user preferences
        }));

        const steps: StepViewModel[] = recipe.recipe_data.steps.map((step, index) => ({
          description: step.description,
          order: index + 1
        }));

        this.formData.set({
          title: recipe.title,
          ingredients,
          steps,
          notes: recipe.recipe_data.notes || '',
          calories: recipe.recipe_data.calories || 0
        });
        this.updateSummary();
      },
      error: (error) => {
        this.snackBar.open('Failed to load recipe', 'Close', { duration: 3000 });
        this.router.navigate(['/recipes']);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private handleParsedRecipe(parsedRecipe: ParsedRecipeDto): void {
    // Convert parsed recipe to form data
    const ingredients: IngredientViewModel[] = parsedRecipe.recipe_data.ingredients.map((ing: { name: string; amount: number; unit: string }) => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      isAllergen: false // Default value, can be updated based on user preferences
    }));

    const steps: StepViewModel[] = parsedRecipe.recipe_data.steps.map((step: { description: string }, index: number) => ({
      description: step.description,
      order: index + 1
    }));

    this.formData.set({
      title: parsedRecipe.title,
      ingredients,
      steps,
      notes: parsedRecipe.recipe_data.notes || '',
      calories: parsedRecipe.recipe_data.calories || 0
    });

    this.updateSummary();
  }

  onFormDataChange(data: RecipeFormViewModel): void {
    this.formData.set(data);
    this.updateSummary();
  }

  onCaloriesUpdated(calories: number): void {
    this.formData.update(data => ({
      ...data,
      calories
    }));
  }

  private updateSummary(): void {
    const data = this.formData();
    this.summary.set({
      totalCalories: data.calories || 0,
      ingredients: data.ingredients
    });
  }

  getRecipeData(): RecipeDataDto {
    const data = this.formData();
    return {
      ingredients: data.ingredients.map(({ isAllergen, ...ing }) => ing),
      steps: data.steps.map(({ order, ...step }) => step),
      notes: data.notes,
      calories: data.calories
    };
  }

  onCancel(): void {
    const id = this.recipeId();
    if (id) {
      this.router.navigate(['/recipes', id]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onSave(): void {
    this.isLoading.set(true);
    const formData = this.formData();

    // Convert ViewModel back to DTO format
    const recipeData = {
      title: formData.title,
      recipe_data: {
        ...this.getRecipeData(),
        calories: formData.calories
      }
    };

    // Check if we're creating a new recipe or updating existing one
    if (!this.recipeId()) {
      // Create new recipe
      this.recipeService.createRecipe(recipeData).subscribe({
        next: (response) => {
          this.snackBar.open('Recipe created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/recipes', response.id]);
        },
        error: (error) => {
          this.snackBar.open('Failed to create recipe', 'Close', { duration: 3000 });
          this.isLoading.set(false);
        }
      });
    } else {
      // Update existing recipe
      this.recipeService.updateRecipe(this.recipeId()!, recipeData).subscribe({
        next: (response) => {
          this.snackBar.open('Recipe updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/recipes', this.recipeId()]);
        },
        error: (error) => {
          this.snackBar.open('Failed to update recipe', 'Close', { duration: 3000 });
          this.isLoading.set(false);
        }
      });
    }
  }

  onSaveError(error: string): void {
    this.snackBar.open(error, 'Close', { duration: 3000 });
    this.isLoading.set(false);
  }
} 