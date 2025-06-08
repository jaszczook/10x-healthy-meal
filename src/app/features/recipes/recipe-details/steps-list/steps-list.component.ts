import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { StepDto } from '../../../../../types/dto';

@Component({
  selector: 'app-steps-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './steps-list.component.html',
  styleUrls: ['./steps-list.component.scss']
})
export class StepsListComponent {
  @Input({ required: true }) steps!: StepDto[];
} 