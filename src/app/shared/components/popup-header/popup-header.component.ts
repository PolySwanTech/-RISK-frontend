import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-popup-header',
  imports: [MatIconModule, MatCardModule, MatButtonModule],
  templateUrl: './popup-header.component.html',
  styleUrl: './popup-header.component.scss'
})
export class PopupHeaderComponent {

  @Input() title: string | null = null;  // Default value if not passed
  @Input() showClose: boolean = true; // Default to true if not provided
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    // If 'title' is not set, throw an error
    if (!this.title || this.title.trim() === '') {
      throw new Error('The "title" input is required for the ExampleComponent!');
    }
  }

}
