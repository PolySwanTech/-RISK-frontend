import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DateRangePickerComponent } from "../date-range-picker/date-range-picker.component";


@Component({
  selector: 'app-filter-table',
  standalone: true,
  templateUrl: './filter-table.component.html',
  styleUrls: ['./filter-table.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    DateRangePickerComponent
  ]
})
export class FilterTableComponent implements OnChanges {

  @Input() availableFilters: {
    key: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'date' | 'numberRange';
    icon?: string;
    options?: (string | { value: string, label: string })[];
  }[] = [];

  @Output() filtersChanged = new EventEmitter<Record<string, any>>();

  constructor(private fb: FormBuilder) { }

  filtersForm!: FormGroup;
  dropdownOpen = false;
  activeFilterKeys: string[] = [];
  private valueChangesSub?: Subscription;

  isOptionObject(opt: unknown): opt is { value: string; label: string } {
    return typeof opt === 'object' && opt !== null && 'label' in opt && 'value' in opt;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['availableFilters']) {
      const group: any = {};
      this.availableFilters.forEach(f => group[f.key] = ['']);
      this.filtersForm = this.fb.group(group);

      // Nettoyer ancienne souscription
      this.valueChangesSub?.unsubscribe();
      this.valueChangesSub = this.filtersForm.valueChanges.subscribe(values => {
        const activeFilters: Record<string, any> = {};
        for (const key of this.activeFilterKeys) {
          const value = values[key];
          if (value !== null && value !== '') {
            activeFilters[key] = value;
          }
        }
        this.filtersChanged.emit(activeFilters);
      });
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  addFilter(key: string) {
    if (!this.activeFilterKeys.includes(key)) {
      this.activeFilterKeys.push(key);
    }
    this.dropdownOpen = false;
  }

  removeAllFilters() {
    this.activeFilterKeys = [];
    this.filtersForm.reset();
  }

  removeFilter(key: string) {
    this.activeFilterKeys = this.activeFilterKeys.filter(k => k !== key);
    this.filtersForm.get(key)?.reset();
  }

  get availableOptions() {
    return this.availableFilters.filter(f => !this.activeFilterKeys.includes(f.key));
  }

  getFilterMeta(key: string) {
    return this.availableFilters.find(f => f.key === key);
  }

  getFilterLabel(key: string): string {
    return this.getFilterMeta(key)?.label ?? key;
  }

  onNumberRangeChange(key: string, bound: 'min' | 'max', value: number) {
  const current = this.filtersForm.get(key)?.value || {};
  const updated = { ...current, [bound]: value };
  this.filtersForm.get(key)?.setValue(updated);
}

getValueAsNumber(event: Event): number {
  const input = event.target as HTMLInputElement;
  return input.valueAsNumber;
}
}