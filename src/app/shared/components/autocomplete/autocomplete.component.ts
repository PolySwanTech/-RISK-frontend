import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-autocomplete',
  imports: [
      CommonModule,
      FormsModule,
      MatCardModule,
      MatCheckboxModule,
      MatButtonModule,
      MatFormFieldModule,
      MatInputModule,
      MatAutocompleteModule
    ],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss'
})
export class AutocompleteComponent {

  @Input() list: any[] = [];
  @Input() property: string = 'name';
  @Input() placeholder: string = 'Liste';
  @Output() selectedEvent = new EventEmitter<any>();
  filteredList: any[] = [];
  selected: any | null = null;
  
  searchQuery: string | any | null = null;
  
  constructor(
  ) { }
  
  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.filteredList = this.list;
  }

  selectUser(element: any): void {
    this.selected = element;
   
    this.selectedEvent.emit(element.id);
  }

  searchQueryEvent(): void {
    this.selectedEvent.emit(this.searchQuery);
  }

  filterBySearch(): void {

    if (!this.searchQuery) {
      this.filteredList = this.list;
      return;
    }

    if (typeof this.searchQuery === 'string') {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredList = this.list.filter(element =>
        element[this.property].toLowerCase().includes(query)
      );
    } else {
      this.filteredList = this.list.filter(element =>
        element[this.property] === (this.searchQuery as any)[this.property] ? (this.searchQuery as any)[this.property] : ''
      );
    }
  }

  displayFn = (element: any): string => {
    return element ? element[this.property] : '';
  }
}
