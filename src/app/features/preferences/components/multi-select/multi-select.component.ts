import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface Option {
  key: string;
  label: string;
}

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

  @Input() set options(value: Option[]) {
    this._options = value;
  }
  get options(): Option[] {
    return this._options;
  }

  @Input() set value(value: string[]) {
    if (!value) {
      this.selectedItems.set([]);
      return;
    }
    // Convert string values to Option objects
    const options = value.map(v => {
      const option = this._options.find(opt => 
        opt.key.toLowerCase() === v.toLowerCase() || 
        opt.label.toLowerCase() === v.toLowerCase()
      );
      return option || { key: v.toLowerCase(), label: v };
    });
    this.selectedItems.set(options);
  }

  @Output() onChange = new EventEmitter<string[]>();

  private _label = '';
  private _options: Option[] = [];
  selectedItems = signal<Option[]>([]);
  itemCtrl = new FormControl('');
  filteredItems: Observable<Option[]>;

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
      const option = this._options.find(opt => 
        opt.label.toLowerCase() === value.toLowerCase() || 
        opt.key.toLowerCase() === value.toLowerCase()
      );
      if (option && !this.selectedItems().some(item => item.key.toLowerCase() === option.key.toLowerCase())) {
        this.selectedItems.update(items => [...items, option]);
        this.onChange.emit(this.selectedItems().map(item => item.key));
      }
    }
    event.chipInput!.clear();
    this.itemCtrl.setValue(null);
  }

  remove(item: Option): void {
    this.selectedItems.update(items => items.filter(i => i.key !== item.key));
    this.onChange.emit(this.selectedItems().map(item => item.key));
  }

  selected(event: any): void {
    const option = event.option.value as Option;
    if (!this.selectedItems().some(item => item.key.toLowerCase() === option.key.toLowerCase())) {
      this.selectedItems.update(items => [...items, option]);
      this.onChange.emit(this.selectedItems().map(item => item.key));
    }
    this.itemCtrl.setValue(null);
  }

  private _filter(value: string): Option[] {
    const filterValue = value.toLowerCase();
    return this._options.filter(option => 
      (option.label.toLowerCase().includes(filterValue) || 
       option.key.toLowerCase().includes(filterValue)) && 
      !this.selectedItems().some(item => item.key.toLowerCase() === option.key.toLowerCase())
    );
  }

  // Helper method to get the proper label for a value
  getProperLabel(value: string): string {
    const option = this._options.find(opt => 
      opt.label.toLowerCase() === value.toLowerCase() || 
      opt.key.toLowerCase() === value.toLowerCase()
    );
    return option?.label || value;
  }
} 