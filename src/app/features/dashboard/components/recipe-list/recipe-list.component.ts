import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Recipe } from '../../types';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
  ],
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent {
  @Input({ required: true }) recipes: Recipe[] = [];
  @Output() recipeClick = new EventEmitter<string>();

  onRecipeClick(recipeId: string): void {
    this.recipeClick.emit(recipeId);
  }
} 