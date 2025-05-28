import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent {
  @Input({ required: true }) notes!: string;
} 