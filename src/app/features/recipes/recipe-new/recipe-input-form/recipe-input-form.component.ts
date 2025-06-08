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

  recipeText = `
Ingredients:

2 cups of milk (500 ml)
1 cup of wheat flour (about 150 g)
2 eggs
a pinch of salt
1 tablespoon of oil (or melted butter) + a bit for frying
(optional) 1 teaspoon of sugar - if you want them sweet
Instructions:

In a bowl, whisk eggs with milk.
Add flour, salt (and sugar if desired), mix thoroughly with a whisk or mixer until the batter is smooth - without lumps.
Add a tablespoon of oil and mix again.
Let the batter rest for 10-15 minutes (optional, but the batter will bind better).
Heat a pan well (preferably non-stick or crepe pan), lightly grease it with oil or butter.
Pour a thin layer of batter onto the pan, spread it evenly with a circular motion.
Fry for about 1-2 minutes on each side - until lightly browned.
  `;

  handleSubmit() {
    if (this.recipeText.trim()) {
      this.onSubmit.emit(this.recipeText);
    }
  }
} 