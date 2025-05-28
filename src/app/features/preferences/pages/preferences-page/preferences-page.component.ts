import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PreferencesFormComponent } from '../../components/preferences-form/preferences-form.component';
import { UserPreferencesDto, UserPreferencesCommandModel } from '../../../../../types/dto';
import { PreferencesService } from '../../services/preferences.service';
import { Subject, takeUntil, tap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-preferences-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSnackBarModule,
    PreferencesFormComponent
  ],
  templateUrl: './preferences-page.component.html',
  styleUrls: ['./preferences-page.component.scss']
})
export class PreferencesPageComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private preferencesService = inject(PreferencesService);
  private destroy$ = new Subject<void>();
  private isSubmitting = false;

  preferences = signal<UserPreferencesDto | null>(null);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadPreferences();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPreferences(): void {
    this.isLoading.set(true);
    this.preferencesService.getCurrentUserPreferences()
      .pipe(
        catchError(error => {
          // If it's a 304 response, treat it as success
          if (error.status === 304) {
            return of(error.error || null);
          }
          throw error;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.preferences.set(response);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading preferences:', error);
          this.showError('Failed to load preferences');
          this.isLoading.set(false);
        }
      });
  }

  onSubmit(data: UserPreferencesCommandModel): void {
    if (this.isSubmitting) {
      console.log('Already submitting, ignoring duplicate submission');
      return;
    }

    console.log('Starting preferences submission');
    this.isSubmitting = true;
    this.isLoading.set(true);

    this.preferencesService.updateCurrentUserPreferences(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Preferences submission completed');
          this.preferences.set(response);
          this.showSuccess('Preferences saved successfully');
          this.isLoading.set(false);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error saving preferences:', error);
          this.showError('Failed to save preferences');
          this.isLoading.set(false);
          this.isSubmitting = false;
        }
      });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
} 