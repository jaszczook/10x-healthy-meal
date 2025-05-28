import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { RecipeDetailDto } from '../../../../../types/dto';
import { IngredientsListComponent } from '../ingredients-list/ingredients-list.component';
import { StepsListComponent } from '../steps-list/steps-list.component';
import { NotesComponent } from '../notes/notes.component';

@Component({
  selector: 'app-recipe-tabs',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    IngredientsListComponent,
    StepsListComponent,
    NotesComponent
  ],
  templateUrl: './recipe-tabs.component.html',
  styleUrls: ['./recipe-tabs.component.scss']
})
export class RecipeTabsComponent {
  @Input({ required: true }) recipe!: RecipeDetailDto;
} 