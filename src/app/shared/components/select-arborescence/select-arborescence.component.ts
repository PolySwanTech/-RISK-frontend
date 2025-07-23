import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Process } from '../../../core/models/Process';

@Component({
  selector: 'app-select-arborescence',
  imports: [MatFormFieldModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule],
  templateUrl: './select-arborescence.component.html',
  styleUrl: './select-arborescence.component.scss'
})
export class SelectArborescenceComponent {

  @Input() list: any[] = [];
  @Input() placeholder: string = '';
  @Output() changeValue = new EventEmitter<any>();
  @Input() id: string = "";

  searchControl = new FormControl<Process | null>(null);

  displayFn(process: Process): string {
    return process ? process.name : '';
  }

  filteredOptions = this.list;

  ngOnInit() {
    this.filteredOptions = this.list;

    if (this.id) {
    const found = this.list
      .flatMap(group => [group, ...(group.enfants || [])])
      .find(item => item.id === this.id);

    if (found) {
      this.searchControl.setValue(found);
    }
  }

    this.searchControl.valueChanges.subscribe((value: Process | string | null) => {
      this.filteredOptions = this.filterGroups(value);
      if (value && typeof value === 'object') {
        this.changeValue.emit(value);
      }
    });
  }

  filterGroups(search: Process | string | null) {
    let filterValue = '';

    if (typeof search === 'string') {
      filterValue = search.toLowerCase();
    } else if (search && search.name) {
      filterValue = search.name.toLowerCase();
    } else {
      return this.list;
    }

    return this.list
      .map(group => {
        const enfants = group.enfants.filter((child: { name: string; }) =>
          child.name.toLowerCase().includes(filterValue)
        );
        const parentMatch = group.name.toLowerCase().includes(filterValue);
        if (parentMatch || enfants.length > 0) {
          return {
            id: group.id,
            name: group.name,
            enfants: enfants,
          };
        }
        return null;
      })
      .filter(group => group !== null);
  }

  onChange = (_: any) => { };
  onTouched = () => { };

  writeValue(obj: any): void {
    this.searchControl.setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.searchControl.disable() : this.searchControl.enable();
  }
}