import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToDoService } from '../../core/services/to-do/to-do.service';
import { ToDoLabels, ToDoType } from '../../core/enum/to-do.enum';
import { ToDo } from '../../core/models/ToDo';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatTooltipModule
  ],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss'
})
export class TodoComponent implements OnInit {
  private toDoService = inject(ToDoService);
  private router = inject(Router);

  toDoItems: ToDo[] = [];
  currentView: 'grouped' | 'unified' = 'grouped';
  currentTypeFilter: { value: ToDoType | null, label: string } = { value: null, label: 'Tous' };

  collapsedGroups = {
    [ToDoType.ACTION_PLAN]: false,
    [ToDoType.CONTROL]: false,
    [ToDoType.INCIDENT]: false,
  };

  typeFilters = [
    { value: null, label: 'Tous' },
    { value: ToDoType.ACTION_PLAN, label: ToDoLabels[ToDoType.ACTION_PLAN] },
    { value: ToDoType.INCIDENT, label: ToDoLabels[ToDoType.INCIDENT] },
    { value: ToDoType.CONTROL, label: ToDoLabels[ToDoType.CONTROL] }
  ];

  todoLabels = ToDoLabels;
  todoEnum = ToDoType;

  ngOnInit() {
    this.toDoService.getToDos().subscribe(data => {
      this.toDoItems = data;
    });
  }

  setTypeFilter(filter: { value: ToDoType | null, label: string } | { value: ToDoType | null, label: string }[]) {
    // Handle both single filter and array (from mat-chip-listbox change event)
    if (Array.isArray(filter)) {
      this.currentTypeFilter = filter[0] || this.typeFilters[0];
    } else {
      this.currentTypeFilter = filter;
    }
  }

  toggleGroup(groupType: ToDoType) {
    this.collapsedGroups[groupType] = !this.collapsedGroups[groupType];
  }

  getItemCount(type: ToDoType): number {
    return this.getFilteredItems(type).length || 0;
  }

  getFilteredItems(type: ToDoType) {
    return this.toDoItems.filter(item => item.type == type);
  }

  getAllFilteredItems() {
    return this.currentTypeFilter.value == null 
      ? this.toDoItems 
      : this.getFilteredItems(this.currentTypeFilter.value);
  }

  getFilteredGroupCount(type: ToDoType): number {
    return this.getFilteredItems(type).length;
  }

  shouldShowGroup(type: ToDoType): boolean {
    return this.currentTypeFilter.value == null || this.currentTypeFilter.value === type;
  }

  shouldShowItem(item: ToDo): boolean {
    return this.currentTypeFilter.value == null || item.type === this.currentTypeFilter.value;
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case ToDoType.ACTION_PLAN: return 'plans';
      case ToDoType.INCIDENT: return 'incidents';
      case ToDoType.CONTROL: return 'controls';
      default: return type;
    }
  }

  getDateLabel(item: ToDo): string {
    switch (item.type) {
      case ToDoType.ACTION_PLAN: return 'Échéance';
      case ToDoType.INCIDENT: return 'Créé';
      case ToDoType.CONTROL: return 'Planifié';
      default: return 'Date';
    }
  }

  viewItem(item: ToDo) {
    switch (item.type) {
      case ToDoType.ACTION_PLAN:
        this.router.navigate(['action-plan', item.id]);
        break;
      case ToDoType.INCIDENT:
        this.router.navigate(['incident', item.id]);
        break;
      case ToDoType.CONTROL:
        this.router.navigate(['control', 'details', item.id]);
        break;
      default:
        console.warn('Unknown ToDo type:', item.type);
        break;
    }
  }
}