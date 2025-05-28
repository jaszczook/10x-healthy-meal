import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecipeDetailDto } from '../../../../types/dto';
import { RecipeService } from '../services/recipe.service';
import { RecipeSummaryComponent } from './recipe-summary/recipe-summary.component';
import { RecipeTabsComponent } from './recipe-tabs/recipe-tabs.component';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    RecipeSummaryComponent,
    RecipeTabsComponent
  ],
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.scss']
})
export class RecipeDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly recipeService = inject(RecipeService);
  private readonly dialog = inject(MatDialog);

  recipe = signal<RecipeDetailDto | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  deleteState = signal({
    isOpen: false,
    recipeId: '',
    recipeTitle: ''
  });

  ngOnInit() {
    this.loadRecipe();
  }

  loadRecipe() {
    const recipeId = this.route.snapshot.paramMap.get('id');
    if (!recipeId) {
      this.error.set('Recipe ID is missing');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.recipeService.getRecipe(recipeId).subscribe({
      next: (recipe: RecipeDetailDto) => {
        this.recipe.set(recipe);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  navigateToEdit() {
    const recipe = this.recipe();
    if (!recipe) return;
    
    this.router.navigate(['/recipes/edit', recipe.id]);
  }

  openDeleteDialog() {
    const recipe = this.recipe();
    if (!recipe) return;

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: { recipeTitle: recipe.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteRecipe();
      }
    });
  }

  private deleteRecipe() {
    const recipe = this.recipe();
    if (!recipe) return;

    this.loading.set(true);
    this.error.set(null);

    this.recipeService.deleteRecipe(recipe.id).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }
} 