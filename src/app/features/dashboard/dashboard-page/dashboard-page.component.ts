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
import { Recipe, RecipeListResponse, SortOption } from '../types';

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
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Filters -->
      <app-recipe-filters
        [sortOptions]="sortOptions"
        [initialSortBy]="sortBy()"
        [initialSortDirection]="sortDirection()"
        [initialSearchTerm]="searchTerm()"
        (filtersChanged)="onFiltersChange($event)"
      ></app-recipe-filters>

      <!-- Loading state -->
      @if (isLoading()) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner></mat-spinner>
        </div>
      }

      <!-- Error state -->
      @if (error()) {
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong class="font-bold">Error!</strong>
          <span class="block sm:inline"> {{ error() }}</span>
        </div>
      }

      <!-- Recipe list -->
      @if (!isLoading() && !error()) {
        <app-recipe-list
          [recipes]="recipes()"
          (recipeClick)="onRecipeClick($event)"
        ></app-recipe-list>

        <!-- Pagination -->
        <app-paginator
          [length]="totalItems()"
          [pageSize]="pageSize()"
          [pageIndex]="currentPage()"
          (pageChange)="onPageChange($event)"
        ></app-paginator>
      }

      <!-- Add recipe FAB -->
      <button
        mat-fab
        color="primary"
        class="fixed bottom-8 right-8"
        (click)="onAddRecipe()"
      >
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `
})
export class DashboardPageComponent {
  // State
  recipes = signal<Recipe[]>([]);
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
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      sortDirection: this.sortDirection(),
      searchTerm: this.searchTerm(),
    }).subscribe({
      next: (response: RecipeListResponse) => {
        this.recipes.set(response.items);
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