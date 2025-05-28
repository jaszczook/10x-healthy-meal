import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { IngredientViewModel, UserPreferencesDto } from '../../../../../../types/dto';

@Component({
  selector: 'app-ingredients-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './ingredients-list.component.html',
  styleUrl: './ingredients-list.component.scss'
})
export class IngredientsListComponent {
  @Input() userPreferences: UserPreferencesDto | null = null;
  @Input() set ingredients(value: IngredientViewModel[]) {
    this._ingredients = value;
  }
  @Output() ingredientsChange = new EventEmitter<IngredientViewModel[]>();

  private _ingredients: IngredientViewModel[] = [];
  get ingredients(): IngredientViewModel[] {
    return this._ingredients;
  }
  displayedColumns: string[] = ['name', 'amount', 'unit', 'actions'];

  units = [
    'g', 'kg', 'oz', 'lb', 'ml', 'l', 'fl oz', 'cup', 'pint', 'quart', 'gallon',
    'tbsp', 'tsp', 'piece', 'pinch', 'whole', 'slice', 'clove', 'bunch', 'can', 'jar'
  ];

  addIngredient(): void {
    this.ingredients.push({
      name: '',
      amount: 0,
      unit: 'g',
      isAllergen: false
    });
    this.ingredientsChange.emit(this.ingredients);
  }

  removeIngredient(index: number): void {
    if (this.ingredients.length <= 1) return;
    this.ingredients.splice(index, 1);
    this.ingredientsChange.emit(this.ingredients);
  }

  updateIngredient(index: number, field: keyof IngredientViewModel, value: string | number | boolean): void {
    (this.ingredients[index] as any)[field] = value;
    this.ingredientsChange.emit(this.ingredients);
  }
} 