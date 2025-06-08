import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RecipeSummaryViewModel, UserPreferencesDto } from '../../../../../types/dto';

@Component({
  selector: 'app-recipe-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './recipe-summary.component.html',
  styleUrl: './recipe-summary.component.scss'
})
export class RecipeSummaryComponent {
  @Input({ required: true }) summary!: RecipeSummaryViewModel;
  @Input() userPreferences: UserPreferencesDto | null = null;

  get allergens(): string[] {
    return this.summary.ingredients
      .filter(ingredient => ingredient.isAllergen)
      .map(ingredient => ingredient.name);
  }

  get userAllergens(): string[] {
    return this.userPreferences?.allergies || [];
  }

  get userIntolerances(): string[] {
    return this.userPreferences?.intolerances || [];
  }

  isUserAllergen(ingredientName: string): boolean {
    return this.userAllergens.some(allergen => 
      ingredientName.toLowerCase().includes(allergen.toLowerCase())
    );
  }

  isUserIntolerance(ingredientName: string): boolean {
    return this.userIntolerances.some(intolerance => 
      ingredientName.toLowerCase().includes(intolerance.toLowerCase())
    );
  }

  get caloriesStatus(): 'under' | 'over' | 'on-target' | 'no-target' {
    const targetCalories = this.userPreferences?.target_calories;
    if (!targetCalories) return 'no-target';
    
    const difference = Math.abs(this.summary.totalCalories - targetCalories);
    const tolerance = targetCalories * 0.1; // 10% tolerance
    
    if (difference <= tolerance) return 'on-target';
    return this.summary.totalCalories > targetCalories ? 'over' : 'under';
  }
} 