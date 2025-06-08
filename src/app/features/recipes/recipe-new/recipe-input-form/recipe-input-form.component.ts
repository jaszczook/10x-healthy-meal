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
To make simple crepes, just grab about two cups of milk and mix it with two eggs in a bowl. Slowly add in a cup of all-purpose flour, a pinch of salt, and if you’re going for a sweet version, maybe a teaspoon of sugar too. Mix everything well—use a whisk or a hand mixer until the batter is smooth and lump-free. Then stir in a tablespoon of oil or melted butter to make the crepes easier to flip and prevent sticking. Let the batter rest for 10 to 15 minutes if you have time—it helps the texture.

Heat up a non-stick or crepe pan over medium heat, brush it lightly with some oil or butter, and pour in just enough batter to coat the bottom when you swirl the pan. Cook the crepe for about a minute or two until it starts to get golden underneath, then flip it and cook the other side briefly.

You can fill them with whatever you like—sweet stuff like jam, Nutella, or fruits, or go savory with things like cheese, spinach, or mushrooms. They’re super versatile and easy to make once you get the hang of it.
  `;

  handleSubmit() {
    if (this.recipeText.trim()) {
      this.onSubmit.emit(this.recipeText);
    }
  }
} 