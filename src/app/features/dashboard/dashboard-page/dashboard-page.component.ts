import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { RecipeService } from '../services/recipe.service';
import { RecipeFiltersComponent } from '../components/recipe-filters/recipe-filters.component';
import { RecipeListComponent } from '../components/recipe-list/recipe-list.component';
import { AppPaginatorComponent } from '../components/app-paginator/app-paginator.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecipeListItemDto, RecipesListResponseDto } from '../../../../types/dto';
import { SortOption } from '../types';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RecipeFiltersComponent,
    RecipeListComponent,
    AppPaginatorComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent {
  // State
  recipes = signal<RecipeListItemDto[]>([]);
  totalItems = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  sortBy = signal('created_at');
  sortDirection = signal<'asc' | 'desc'>('desc');
  searchTerm = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Sort options
  sortOptions: SortOption[] = [
    { value: 'created_at', viewValue: 'Date Created' },
    { value: 'title', viewValue: 'Title' },
    { value: 'prep_time', viewValue: 'Prep Time' },
    { value: 'cook_time', viewValue: 'Cook Time' },
  ];

  constructor(
    private recipeService: RecipeService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    // Set up effect to fetch recipes when filters change
    effect(() => {
      this.fetchRecipes();
    });
  }

  private fetchRecipes(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.recipeService.getRecipes({
      page: this.currentPage() + 1,
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      sortDirection: this.sortDirection(),
      searchTerm: this.searchTerm(),
    }).subscribe({
      next: (response: RecipesListResponseDto) => {
        this.recipes.set(response.data);
        this.totalItems.set(response.total);
      },
      error: (error: unknown) => {
        this.error.set(error instanceof Error ? error.message : 'An error occurred while fetching recipes');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  onFiltersChange(filters: { searchTerm?: string; sortBy?: string; sortDirection?: 'asc' | 'desc' }): void {
    if (filters.searchTerm !== undefined) {
      this.searchTerm.set(filters.searchTerm);
    }
    if (filters.sortBy !== undefined) {
      this.sortBy.set(filters.sortBy);
    }
    if (filters.sortDirection !== undefined) {
      this.sortDirection.set(filters.sortDirection);
    }
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onRecipeClick(recipeId: string): void {
    this.router.navigate(['/recipes', recipeId]);
  }

  onAddRecipe(): void {
    this.router.navigate(['/recipes/new']);
  }
} 