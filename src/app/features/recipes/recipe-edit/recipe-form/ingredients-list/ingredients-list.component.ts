import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
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
  @Input() set ingredients(value: IngredientViewModel[]) {
    this._ingredients.set(value);
  }

  @Input() userPreferences: UserPreferencesDto | null = null;

  @Output() ingredientsChange = new EventEmitter<IngredientViewModel[]>();

  private _ingredients = signal<IngredientViewModel[]>([]);
  
  get ingredients() {
    return this._ingredients();
  }

  displayedColumns: string[] = ['name', 'amount', 'unit', 'actions'];

  units = ['g', 'kg', 'ml', 'l', 'sztuka', 'łyżka', 'łyżeczka', 'szklanka'];

  addIngredient(): void {
    const newIngredient: IngredientViewModel = {
      name: '',
      amount: 0,
      unit: 'g',
      isAllergen: false
    };
    
    const updatedIngredients = [...this._ingredients(), newIngredient];
    this._ingredients.set(updatedIngredients);
    this.ingredientsChange.emit(updatedIngredients);
  }

  removeIngredient(index: number): void {
    const updatedIngredients = this._ingredients().filter((_, i) => i !== index);
    this._ingredients.set(updatedIngredients);
    this.ingredientsChange.emit(updatedIngredients);
  }

  updateIngredient(index: number, field: keyof IngredientViewModel, value: any): void {
    const updatedIngredients = [...this._ingredients()];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    this._ingredients.set(updatedIngredients);
    this.ingredientsChange.emit(updatedIngredients);
  }
} 