import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { RecipeInputFormComponent } from './recipe-input-form/recipe-input-form.component';
import { RecipeService } from '../services/recipe.service';
import { ParseRecipeCommandModel, ParsedRecipeDto } from '../../../../types/dto';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-recipe-new',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatButtonModule,
    RecipeInputFormComponent
  ],
  templateUrl: './recipe-new.component.html',
  styleUrls: ['./recipe-new.component.scss']
})
export class RecipeNewComponent {
  private router = inject(Router);
  private recipeService = inject(RecipeService);
  private snackBar = inject(MatSnackBar);

  isProcessing = signal(false);
  error = signal<string | null>(null);
  recipeText = signal('');
  timeoutId = signal<number | null>(null);

  async handleSubmit(text: string) {
    this.recipeText.set(text);
    this.isProcessing.set(true);
    this.error.set(null);

    try {
      const command: ParseRecipeCommandModel = { recipe_text: text };
      const result = await firstValueFrom(this.recipeService.parseRecipe(command));
      this.handleSuccess(result);
    } catch (err: unknown) {
      this.handleError(err instanceof Error ? err : new Error('Unknown error occurred'));
    }
  }

  handleCancel() {
    if (this.timeoutId()) {
      window.clearTimeout(this.timeoutId()!);
      this.timeoutId.set(null);
    }
    this.isProcessing.set(false);
    this.error.set(null);
  }

  private handleSuccess(result: ParsedRecipeDto) {
    this.isProcessing.set(false);
    // this.router.navigate(['/dashboard']);
    this.router.navigate(['/recipes', 'edit','new'], { 
      state: { parsedRecipe: result }
    });
  }

  private handleError(error: Error) {
    this.isProcessing.set(false);
    this.error.set(error.message);
    this.snackBar.open(error.message, 'Close', { duration: 5000 });
  }
} 