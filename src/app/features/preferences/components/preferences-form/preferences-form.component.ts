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
      // Convert backend values to proper case using the options mapping
      const normalizedAllergies = (value.allergies || []).map(a => 
        this.allergyOptions.find(opt => opt.key === a.toLowerCase())?.key || a.toLowerCase()
      );
      const normalizedIntolerances = (value.intolerances || []).map(i => 
        this.intoleranceOptions.find(opt => opt.key === i.toLowerCase())?.key || i.toLowerCase()
      );

      this.form.patchValue({
        target_calories: value.target_calories,
        allergies: normalizedAllergies,
        intolerances: normalizedIntolerances
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
    if (this.form.valid) {
      this.submit.emit(this.form.value as UserPreferencesCommandModel);
    }
  }

  onAllergiesChange(allergies: string[]): void {
    // Convert display values back to keys for storage
    const normalizedAllergies = allergies.map(a => 
      this.allergyOptions.find(opt => opt.label === a)?.key || a.toLowerCase()
    );
    this.form.patchValue({ allergies: normalizedAllergies });
  }

  onIntolerancesChange(intolerances: string[]): void {
    // Convert display values back to keys for storage
    const normalizedIntolerances = intolerances.map(i => 
      this.intoleranceOptions.find(opt => opt.label === i)?.key || i.toLowerCase()
    );
    this.form.patchValue({ intolerances: normalizedIntolerances });
  }
} 