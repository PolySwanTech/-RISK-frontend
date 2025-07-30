import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-global-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './global-search-bar.component.html',
  styleUrls: ['./global-search-bar.component.scss']
})
export class GlobalSearchBarComponent {
  @Input() placeholder = "Rechercher...";
  @Input() model = '';
  @Output() modelChange = new EventEmitter<string>();
  @Output() cleared = new EventEmitter<void>();

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.model = value;
    this.modelChange.emit(value);
  }

  clear() {
    this.model = '';
    this.modelChange.emit('');
    this.cleared.emit();
  }
}