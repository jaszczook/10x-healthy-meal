import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RecipeFormViewModel, StepDto, UserPreferencesDto } from '../../../../../types/dto';
import { IngredientsListComponent } from './ingredients-list/ingredients-list.component';
import { StepsListComponent } from './steps-list/steps-list.component';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    IngredientsListComponent,
    StepsListComponent
  ],
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.scss'
})
export class RecipeFormComponent {
  private fb = inject(FormBuilder);
  private _userPreferences = signal<UserPreferencesDto | null>(null);

  @Input() set formData(value: RecipeFormViewModel) {
    this.form.patchValue(value);
    this.ingredients.set(value.ingredients);
    if (value.steps && value.steps.length > 0) {
      this.steps.set(value.steps.map((step, index) => ({
        description: step.description,
        order: step.order || index + 1
      })));
    }
  }

  @Input() set userPreferences(value: UserPreferencesDto) {
    this._userPreferences.set(value);
  }

  @Output() formDataChange = new EventEmitter<RecipeFormViewModel>();

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    notes: ['']
  });

  ingredients = signal<RecipeFormViewModel['ingredients']>([]);
  steps = signal<StepDto[]>([]);

  get userPreferences(): UserPreferencesDto | null {
    return this._userPreferences();
  }

  onIngredientsChange(ingredients: RecipeFormViewModel['ingredients']): void {
    this.ingredients.set(ingredients);
    this.emitFormData();
  }

  onStepsChange(steps: StepDto[]): void {
    this.steps.set(steps);
    this.emitFormData();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.emitFormData();
    }
  }

  private emitFormData(): void {
    const formData: RecipeFormViewModel = {
      ...this.form.value,
      ingredients: this.ingredients(),
      steps: this.steps().map((step, index) => ({
        description: step.description,
        order: index + 1
      }))
    } as RecipeFormViewModel;
    
    this.formDataChange.emit(formData);
  }
} 