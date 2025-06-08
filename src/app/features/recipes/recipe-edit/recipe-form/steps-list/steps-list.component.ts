import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';
import { StepDto } from '../../../../../../types/dto';

@Component({
  selector: 'app-steps-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './steps-list.component.html',
  styleUrl: './steps-list.component.scss'
})
export class StepsListComponent {
  @Input() set steps(value: StepDto[]) {
    if (this.hasStepsChanged(value)) {
      this._steps = [...value];
      this.updateFormArray();
    }
  }
  @Output() stepsChange = new EventEmitter<StepDto[]>();

  private _steps: StepDto[] = [];
  get steps(): StepDto[] {
    return this._steps;
  }

  displayedColumns: string[] = ['order', 'description', 'actions'];
  stepsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.stepsForm = this.fb.group({
      stepsArray: this.fb.array([])
    });
  }

  private hasStepsChanged(newSteps: StepDto[]): boolean {
    if (this._steps.length !== newSteps.length) {
      return true;
    }
    
    return this._steps.some((step, index) => 
      !newSteps[index] || step.description !== newSteps[index].description
    );
  }

  private updateFormArray(): void {
    const stepsArray = this.stepsForm.get('stepsArray') as FormArray;
    
    // Clear existing controls
    while (stepsArray.length !== 0) {
      stepsArray.removeAt(0);
    }
    
    // Add new controls for each step
    this._steps.forEach(step => {
      stepsArray.push(this.fb.control(step.description));
    });
  }

  get stepsArray(): FormArray {
    return this.stepsForm.get('stepsArray') as FormArray;
  }

  getFormControl(index: number): FormControl {
    return this.stepsArray.at(index) as FormControl;
  }

  onStepChange(index: number): void {
    const control = this.getFormControl(index);
    if (control && control.value !== null && this._steps[index]) {
      this._steps[index].description = control.value;
      this.stepsChange.emit([...this._steps]);
    }
  }

  addStep(): void {
    const newStep = { description: '' };
    this._steps.push(newStep);
    this.stepsArray.push(this.fb.control(''));
    this.stepsChange.emit([...this._steps]);
  }

  removeStep(index: number): void {
    if (this._steps.length <= 1) return;
    this._steps.splice(index, 1);
    this.stepsArray.removeAt(index);
    this.stepsChange.emit([...this._steps]);
  }
} 