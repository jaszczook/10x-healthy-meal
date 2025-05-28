import { Component, EventEmitter, Input, Output, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RecipeFormViewModel, StepDto, UserPreferencesDto, RecipeDetailDto, CreateRecipeCommandModel } from '../../../../../types/dto';
import { IngredientsListComponent } from './ingredients-list/ingredients-list.component';
import { StepsListComponent } from './steps-list/steps-list.component';
import { RecipeService } from '../../services/recipe.service';
import { firstValueFrom, Subscription } from 'rxjs';

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
export class RecipeFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);
  private _userPreferences = signal<UserPreferencesDto | null>(null);
  private _formData: RecipeFormViewModel | null = null;
  private isUpdatingFromParent = false;
  private formSubscription: Subscription | null = null;

  @Input() set formData(value: RecipeFormViewModel) {
    this._formData = value;
    this.isUpdatingFromParent = true;
    this.form.patchValue({
      title: value.title,
      notes: value.notes
    });
    this.ingredients.set(value.ingredients);
    this.steps.set(value.steps);
    this.isUpdatingFromParent = false;
  }

  @Input() set userPreferences(value: UserPreferencesDto) {
    this._userPreferences.set(value);
  }

  @Output() formDataChange = new EventEmitter<RecipeFormViewModel>();
  @Output() saveSuccess = new EventEmitter<RecipeDetailDto>();
  @Output() saveError = new EventEmitter<string>();

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    notes: ['']
  });

  ingredients = signal<RecipeFormViewModel['ingredients']>([]);
  steps = signal<StepDto[]>([]);

  get userPreferences(): UserPreferencesDto | null {
    return this._userPreferences();
  }

  ngOnInit(): void {
    this.formSubscription = this.form.valueChanges.subscribe(() => {
      if (!this.isUpdatingFromParent) {
        this.formDataChange.emit(this.getFormData());
      }
    });
  }

  ngOnDestroy(): void {
    this.formSubscription?.unsubscribe();
  }

  onIngredientsChange(ingredients: RecipeFormViewModel['ingredients']): void {
    if (!this.isUpdatingFromParent) {
      this.ingredients.set(ingredients);
      this.formDataChange.emit(this.getFormData());
    }
  }

  onStepsChange(steps: StepDto[]): void {
    if (!this.isUpdatingFromParent) {
      this.steps.set(steps);
      this.formDataChange.emit(this.getFormData());
    }
  }

  private getFormData(): RecipeFormViewModel {
    const formData = {
      ...this.form.value,
      ingredients: this.ingredients(),
      steps: this.steps().map((step, index) => ({
        description: step.description,
        order: index + 1
      })),
      calories: this._formData?.calories || 0
    } as RecipeFormViewModel;
    return formData;
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      try {
        const formData = this.getFormData();
        const recipeCommand: CreateRecipeCommandModel = {
          title: formData.title,
          recipe_data: {
            ingredients: formData.ingredients,
            steps: formData.steps.map(step => ({ description: step.description })),
            notes: formData.notes,
            calories: formData.calories
          }
        };
        const recipe = await firstValueFrom(this.recipeService.createRecipe(recipeCommand));
        this.saveSuccess.emit(recipe);
      } catch (error) {
        this.saveError.emit(error instanceof Error ? error.message : 'Failed to save recipe');
      }
    }
  }
} 