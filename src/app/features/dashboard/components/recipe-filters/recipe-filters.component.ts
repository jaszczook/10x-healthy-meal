import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { SortOption, FilterChangePayload } from '../../types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recipe-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatIconModule,
  ],
  templateUrl: './recipe-filters.component.html'
})
export class RecipeFiltersComponent {
  @Input({ required: true }) sortOptions: SortOption[] = [];
  @Input() initialSortBy: string = 'created_at';
  @Input() initialSortDirection: 'asc' | 'desc' = 'desc';
  @Input() initialSearchTerm: string = '';
  @Output() filtersChanged = new EventEmitter<FilterChangePayload>();

  searchTerm: string = this.initialSearchTerm;
  sortBy: string = this.initialSortBy;
  sortDirection: 'asc' | 'desc' = this.initialSortDirection;

  private searchSubject = new Subject<string>();

  constructor() {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filtersChanged.emit({ searchTerm: term });
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onFiltersChange(): void {
    this.filtersChanged.emit({
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    });
  }
} 