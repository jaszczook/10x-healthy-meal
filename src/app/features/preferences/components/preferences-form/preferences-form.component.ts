import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MultiSelectComponent } from '../multi-select/multi-select.component';
import { UserPreferencesDto, UserPreferencesCommandModel } from '../../../../../types/dto';

interface Option {
  key: string;
  label: string;
}

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
        allergies: this.normalizeValues(value.allergies || [], this.allergyOptions),
        intolerances: this.normalizeValues(value.intolerances || [], this.intoleranceOptions)
      }, { emitEvent: true });
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
    { key: 'peanuts', label: 'Peanuts' },
    { key: 'tree_nuts', label: 'Tree Nuts' },
    { key: 'milk', label: 'Milk' },
    { key: 'eggs', label: 'Eggs' },
    { key: 'soy', label: 'Soy' },
    { key: 'wheat', label: 'Wheat' },
    { key: 'fish', label: 'Fish' },
    { key: 'shellfish', label: 'Shellfish' }
  ];

  intoleranceOptions = [
    { key: 'lactose', label: 'Lactose' },
    { key: 'gluten', label: 'Gluten' },
    { key: 'fructose', label: 'Fructose' },
    { key: 'histamine', label: 'Histamine' }
  ];

  onSubmit(): void {
    console.log('Form submission triggered');
    if (this.form.valid) {
      console.log('Form is valid, emitting submit event');
      this.submit.emit(this.form.value as UserPreferencesCommandModel);
    } else {
      console.log('Form is invalid, not emitting submit event');
    }
  }

  onSelectionChange(field: 'allergies' | 'intolerances', values: string[]): void {
    const options = field === 'allergies' ? this.allergyOptions : this.intoleranceOptions;
    const normalizedValues = this.normalizeValues(values, options);
    this.form.patchValue({ [field]: normalizedValues }, { emitEvent: false });
  }

  private normalizeValues(values: string[], options: Option[]): string[] {
    return values.map(v => 
      options.find(opt => opt.label === v)?.key || v.toLowerCase()
    );
  }
} 