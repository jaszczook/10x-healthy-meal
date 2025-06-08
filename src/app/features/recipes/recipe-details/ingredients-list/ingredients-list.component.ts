import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { IngredientDto } from '../../../../../types/dto';

@Component({
  selector: 'app-ingredients-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './ingredients-list.component.html',
  styleUrls: ['./ingredients-list.component.scss']
})
export class IngredientsListComponent {
  @Input({ required: true }) ingredients!: IngredientDto[];
} 