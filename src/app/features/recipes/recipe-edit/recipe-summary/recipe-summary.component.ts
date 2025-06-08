import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { RecipeSummaryViewModel, UserPreferencesDto, RecipeDetailDto, RecipeDataDto } from '../../../../../types/dto';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './recipe-summary.component.html',
  styleUrls: ['./recipe-summary.component.scss']
})
export class RecipeSummaryComponent {
  @Input() summary!: RecipeSummaryViewModel;
  @Input() userPreferences?: UserPreferencesDto;
  @Input() recipeId!: string;
  @Input() recipeData!: RecipeDataDto;
  @Output() caloriesUpdated = new EventEmitter<number>();

  isEditing = false;
  editedCalories = 0;

  constructor(private recipeService: RecipeService) {}

  get caloriesStatus(): 'on-target' | 'under' | 'over' {
    if (!this.userPreferences?.target_calories) return 'on-target';
    
    const target = this.userPreferences.target_calories;
    const current = this.summary.totalCalories;
    const threshold = target * 0.1; // 10% threshold
    
    if (Math.abs(current - target) <= threshold) return 'on-target';
    return current < target ? 'under' : 'over';
  }

  get allergens(): string[] {
    return this.summary.ingredients
      .filter(ing => ing.isAllergen)
      .map(ing => ing.name);
  }

  get userAllergens(): string[] {
    return this.userPreferences?.allergies || [];
  }

  get userIntolerances(): string[] {
    return this.userPreferences?.intolerances || [];
  }

  isUserAllergen(ingredient: string): boolean {
    return this.userAllergens.some(allergen => 
      ingredient.toLowerCase().includes(allergen.toLowerCase())
    );
  }

  isUserIntolerance(ingredient: string): boolean {
    return this.userIntolerances.some(intolerance => 
      ingredient.toLowerCase().includes(intolerance.toLowerCase())
    );
  }

  startEditing(): void {
    this.editedCalories = this.summary.totalCalories;
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  async saveCalories(): Promise<void> {
    try {
      // Create a partial update with just the calories
      const updateData: Partial<RecipeDetailDto> = {
        recipe_data: {
          ...this.recipeData,
          calories: this.editedCalories
        }
      };
      
      await this.recipeService.updateRecipe(this.recipeId, updateData).toPromise();
      this.summary.totalCalories = this.editedCalories;
      this.caloriesUpdated.emit(this.editedCalories);
      this.isEditing = false;
    } catch (error) {
      console.error('Failed to update calories:', error);
      // You might want to show an error message to the user here
    }
  }
} 