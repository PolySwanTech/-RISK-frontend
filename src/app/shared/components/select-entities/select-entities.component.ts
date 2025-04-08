import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { map, Observable, startWith } from 'rxjs';
import { EntitiesService } from '../../../core/services/entities/entities.service';

@Component({
  selector: 'app-select-entities',
  imports: [CommonModule, MatAutocompleteModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './select-entities.component.html',
  styleUrl: './select-entities.component.scss'
})
export class SelectEntitiesComponent {
  entities: EntiteResponsable[] = []

  searchQuery: string | null = null;
  stateCtrl = new FormControl('');
  filteredStates!: Observable<EntiteResponsable[]>;
  filteredEntities!: EntiteResponsable[];

  @Input() placeholder: string = 'Entité parent';
  @Input() selectId: string = '';
  selectedEntity: any;
  @Output() entitieSelected = new EventEmitter<any>();

  aucunEntite = new EntiteResponsable('', 'Aucun', false, [], null);

  constructor(
    private entitiesService: EntitiesService) {

  }

  ngOnInit(): void {
    this.loadEntites();
    
  }

  loadEntites(): void {
    this.entitiesService.loadEntities().subscribe(resp => {
      this.entities = resp;
      if (this.selectId) {
        this.entitiesService.findById(this.selectId).subscribe(entite => {
          this.selectedEntity = entite;
          this.stateCtrl.setValue(this.selectedEntity);
          this.entitieSelected.emit(this.selectedEntity ? this.selectedEntity : this.aucunEntite);
        });
       
      }
      this.entitieSelected.emit(this.searchQuery ? this.searchQuery : this.aucunEntite);
    });
  }

  filterBySearch() {
    if (!this.searchQuery) {
      this.filteredEntities = this.entities;
    } else {
      if (typeof this.searchQuery === 'string') {
        const searchLower = this.searchQuery.toLowerCase();
        this.filteredEntities = this.entities.filter(entite =>
          entite.name.toLowerCase().includes(searchLower)
        );
      }
    }
    this.changeAutocompleteList();
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.searchQuery = event.option.value; // Stocke l'objet utilisateur
    console.log(this.searchQuery);
    this.entitieSelected.emit(this.searchQuery)
  }

  changeAutocompleteList() {
    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(''),
      map(state => (state ? this._filterStates(state) : this.filteredEntities?.slice())),
    );
  }

  private _filterStates(value: any): EntiteResponsable[] {
    if (!value) return this.entities;

    let filterValue: string;

    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (value.name) {
      filterValue = value.name.toLowerCase();
    } else {
      console.warn('Valeur de recherche invalide:', value);
      return [];
    }

    return this.entities.filter(entitie =>
      entitie.name.toLowerCase().includes(filterValue)
    );
  }

  displayFn = (entitie?: EntiteResponsable): string => {
    return entitie ? entitie.name : '';
  };

}
