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
Składniki:

2 szklanki mleka (500 ml)
1 szklanka mąki pszennej (ok. 150 g)
2 jajka
szczypta soli
1 łyżka oleju (lub roztopionego masła) + odrobina do smażenia
(opcjonalnie) 1 łyżeczka cukru – jeśli mają być na słodko
Wykonanie:

W misce roztrzep jajka z mlekiem.
Dodaj mąkę, sól (i ewentualnie cukier), dokładnie wymieszaj trzepaczką lub mikserem, aż ciasto będzie gładkie – bez grudek.
Dodaj łyżkę oleju i ponownie wymieszaj.
Odstaw ciasto na 10–15 minut (opcjonalne, ale ciasto lepiej się „zwiąże”).
Rozgrzej dobrze patelnię (najlepiej teflonową lub naleśnikową), lekko natłuść ją olejem lub masłem.
Wylewaj cienką warstwę ciasta na patelnię, rozprowadzaj równomiernie ruchem okrężnym.
Smaż około 1–2 minuty z każdej strony – aż się lekko zarumieni.
  `;

  handleSubmit() {
    if (this.recipeText.trim()) {
      this.onSubmit.emit(this.recipeText);
    }
  }
} 