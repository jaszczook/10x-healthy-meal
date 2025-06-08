import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
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
    MatTableModule
  ],
  templateUrl: './steps-list.component.html',
  styleUrl: './steps-list.component.scss'
})
export class StepsListComponent {
  @Input() set steps(value: StepDto[]) {
    this._steps = value?.map((step, index) => ({
      description: step.description,
      order: index + 1
    })) || [];
  }

  @Output() stepsChange = new EventEmitter<StepDto[]>();

  private _steps: StepViewModel[] = [];
  get steps(): StepViewModel[] {
    return this._steps;
  }
  displayedColumns: string[] = ['order', 'description', 'actions'];

  addStep(): void {
    this._steps.push({
      description: '',
      order: this._steps.length + 1
    });
    this.stepsChange.emit(this._steps.map(({ description }) => ({ description })));
  }

  removeStep(index: number): void {
    if (this._steps.length <= 1) return;
    this._steps.splice(index, 1);
    this._steps.forEach((step, i) => step.order = i + 1);
    this.stepsChange.emit(this._steps.map(({ description }) => ({ description })));
  }

  updateStep(index: number, description: string): void {
    this._steps[index].description = description;
    this.stepsChange.emit(this._steps.map(({ description }) => ({ description })));
  }

  moveStep(index: number, direction: 'up' | 'down'): void {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this._steps.length) return;
    
    [this._steps[index], this._steps[newIndex]] = [this._steps[newIndex], this._steps[index]];
    this._steps.forEach((step, i) => step.order = i + 1);
    this.stepsChange.emit(this._steps.map(({ description }) => ({ description })));
  }
} 