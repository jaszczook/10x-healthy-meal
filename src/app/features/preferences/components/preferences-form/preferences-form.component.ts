import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MultiSelectComponent } from '../multi-select/multi-select.component';
import { UserPreferencesDto, UserPreferencesCommandModel } from '../../../../../types/dto';

@Component({
  selector: 'app-preferences-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MultiSelectComponent
  ],
  templateUrl: './preferences-form.component.html',
  styleUrls: ['./preferences-form.component.scss']
})
export class PreferencesFormComponent {
  @Input() set initialData(value: UserPreferencesDto | null) {
    if (value) {
      this.form.patchValue({
        target_calories: value.target_calories,
        allergies: value.allergies || [],
        intolerances: value.intolerances || []
      });
    }
  }

  @Input() isLoading = false;

  @Output() submit = new EventEmitter<UserPreferencesCommandModel>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    target_calories: [null as number | null, [Validators.required, Validators.min(1)]],
    allergies: [[] as string[]],
    intolerances: [[] as string[]]
  });

  // These would typically come from a service
  allergyOptions = [
    'Peanuts',
    'Tree Nuts',
    'Milk',
    'Eggs',
    'Soy',
    'Wheat',
    'Fish',
    'Shellfish'
  ];

  intoleranceOptions = [
    'Lactose',
    'Gluten',
    'Fructose',
    'Histamine'
  ];

  onSubmit(): void {
    if (this.form.valid) {
      this.submit.emit(this.form.value as UserPreferencesCommandModel);
    }
  }

  onAllergiesChange(allergies: string[]): void {
    this.form.patchValue({ allergies });
  }

  onIntolerancesChange(intolerances: string[]): void {
    this.form.patchValue({ intolerances });
  }
} 