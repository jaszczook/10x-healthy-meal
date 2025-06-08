import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatTableModule } from '@angular/material/table';
import { StepDto, StepViewModel } from '../../../../../../types/dto';

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
    FormsModule,
    ReactiveFormsModule,
    TextFieldModule,
    CdkTextareaAutosize,
    MatTableModule
  ],
  templateUrl: './steps-list.component.html',
  styleUrl: './steps-list.component.scss'
})
export class StepsListComponent implements OnInit {
  displayedColumns: string[] = ['order', 'description', 'actions'];

  @Input() set steps(value: StepDto[]) {
    if (value && value.length > 0) {
      const stepsWithOrder = value.map((step, index) => ({
        description: step.description || '',
        order: (step as any).order || index + 1
      }));
      this._steps.set(stepsWithOrder);
    } else {
      // Fallback demo steps for debugging
      this._steps.set([
        { description: 'Demo step 1', order: 1 },
        { description: 'Demo step 2', order: 2 }
      ]);
    }
  }

  @Output() stepsChange = new EventEmitter<StepDto[]>();

  private _steps = signal<StepViewModel[]>([]);

  get steps(): StepViewModel[] {
    return this._steps();
  }

  ngOnInit() {
    if (!this._steps().length) {
      this.addStep();
    }
  }

  addStep(): void {
    const newStep: StepViewModel = {
      description: '',
      order: this._steps().length + 1
    };
    
    const updatedSteps = [...this._steps(), newStep];
    this._steps.set(updatedSteps);
    this.stepsChange.emit(updatedSteps.map(({ description }) => ({ description })));
  }

  removeStep(index: number): void {
    if (this._steps().length <= 1) return;
    
    const updatedSteps = this._steps()
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, order: i + 1 }));
    
    this._steps.set(updatedSteps);
    this.stepsChange.emit(updatedSteps.map(({ description }) => ({ description })));
  }

  updateStep(index: number, description: string): void {
    const updatedSteps = [...this._steps()];
    updatedSteps[index] = { ...updatedSteps[index], description };
    this._steps.set(updatedSteps);
    this.stepsChange.emit(updatedSteps.map(({ description }) => ({ description })));
  }

  moveStep(index: number, direction: 'up' | 'down'): void {
    const steps = [...this._steps()];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= steps.length) return;
    
    [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
    
    // Update order numbers
    const updatedSteps = steps.map((step, i) => ({ ...step, order: i + 1 }));
    this._steps.set(updatedSteps);
    this.stepsChange.emit(updatedSteps.map(({ description }) => ({ description })));
  }
} 