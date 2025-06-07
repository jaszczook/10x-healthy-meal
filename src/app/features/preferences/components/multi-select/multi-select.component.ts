import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss']
})
export class MultiSelectComponent {
  @Input() set label(value: string) {
    this._label = value;
  }
  get label(): string {
    return this._label;
  }

  @Input() set options(value: string[]) {
    this._options = value;
  }
  get options(): string[] {
    return this._options;
  }

  @Input() set value(value: string[]) {
    this.selectedItems.set(value || []);
  }

  @Output() onChange = new EventEmitter<string[]>();

  private _label = '';
  private _options: string[] = [];
  selectedItems = signal<string[]>([]);
  itemCtrl = new FormControl('');
  filteredItems: Observable<string[]>;

  constructor() {
    this.filteredItems = this.itemCtrl.valueChanges.pipe(
      startWith(null),
      map((item: string | null) => 
        item ? this._filter(item) : this._options.slice()
      )
    );
  }

  add(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      this.selectedItems.update(items => [...items, value]);
      this.onChange.emit(this.selectedItems());
    }
    event.chipInput!.clear();
    this.itemCtrl.setValue(null);
  }

  remove(item: string): void {
    this.selectedItems.update(items => items.filter(i => i !== item));
    this.onChange.emit(this.selectedItems());
  }

  selected(event: any): void {
    this.selectedItems.update(items => [...items, event.option.viewValue]);
    this.onChange.emit(this.selectedItems());
    this.itemCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this._options.filter(item => 
      item.toLowerCase().includes(filterValue) && 
      !this.selectedItems().includes(item)
    );
  }
} 