import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RecipeDetailDto } from '../../../../../types/dto';

@Component({
  selector: 'app-recipe-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule
  ],
  template: `
    <mat-card>
      <mat-card-content>
        <mat-list>
          <mat-list-item>
            <mat-icon matListItemIcon>schedule</mat-icon>
            <span matListItemTitle>Created</span>
            <span matListItemLine>{{ recipe.created_at | date:'medium' }}</span>
          </mat-list-item>
          
          <mat-list-item>
            <mat-icon matListItemIcon>update</mat-icon>
            <span matListItemTitle>Last Updated</span>
            <span matListItemLine>{{ recipe.updated_at | date:'medium' }}</span>
          </mat-list-item>

          <mat-list-item *ngIf="recipe.recipe_data.calories">
            <mat-icon matListItemIcon>local_fire_department</mat-icon>
            <span matListItemTitle>Calories</span>
            <span matListItemLine>{{ recipe.recipe_data.calories }} kcal</span>
          </mat-list-item>
        </mat-list>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      margin-bottom: 1rem;
    }
  `]
})
export class RecipeSummaryComponent {
  @Input({ required: true }) recipe!: RecipeDetailDto;
} 