import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RecipeListItemDto } from '../../../../../types/dto';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss']
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: RecipeListItemDto;

  onClick(): void {
    // Event will be handled by parent component
  }
} 