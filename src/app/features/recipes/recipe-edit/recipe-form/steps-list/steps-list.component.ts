import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { StepViewModel } from '../../../../../../types/dto';

@Component({
  selector: 'app-steps-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './steps-list.component.html',
  styleUrl: './steps-list.component.scss'
})
export class StepsListComponent {
  @Input() set steps(value: StepViewModel[]) {
    this._steps.set(value);
  }

  @Output() stepsChange = new EventEmitter<StepViewModel[]>();

  private _steps = signal<StepViewModel[]>([]);

  get steps() {
    return this._steps();
  }

  addStep(): void {
    const newStep: StepViewModel = {
      description: '',
      order: this._steps().length + 1
    };
    
    const updatedSteps = [...this._steps(), newStep];
    this._steps.set(updatedSteps);
    this.stepsChange.emit(updatedSteps);
  }

  removeStep(index: number): void {
    const updatedSteps = this._steps()
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, order: i + 1 }));
    
    this._steps.set(updatedSteps);
    this.stepsChange.emit(updatedSteps);
  }

  updateStep(index: number, description: string): void {
    const updatedSteps = [...this._steps()];
    updatedSteps[index] = { ...updatedSteps[index], description };
    this._steps.set(updatedSteps);
    this.stepsChange.emit(updatedSteps);
  }

  moveStep(index: number, direction: 'up' | 'down'): void {
    const steps = [...this._steps()];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= steps.length) return;
    
    [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
    
    // Update order numbers
    const updatedSteps = steps.map((step, i) => ({ ...step, order: i + 1 }));
    this._steps.set(updatedSteps);
    this.stepsChange.emit(updatedSteps);
  }
} 