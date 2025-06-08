import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-recipe-input-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './recipe-input-form.component.html',
  styleUrls: ['./recipe-input-form.component.scss']
})
export class RecipeInputFormComponent {
  @Input() isProcessing = false;
  @Output() onSubmit = new EventEmitter<string>();

  recipeText = '';

  handleSubmit() {
    if (this.recipeText.trim()) {
      this.onSubmit.emit(this.recipeText);
    }
  }
} 