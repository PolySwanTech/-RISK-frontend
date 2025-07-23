import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-go-back',
  imports: [MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './go-back.component.html',
  styleUrls: ['./go-back.component.scss']
})
export class GoBackComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() buttons: GoBackButton[] = [];

  @Input() onBack?: () => void;

  goBack() {
    if (this.onBack) this.onBack();
    else history.back(); // fallback
  }
}

export interface GoBackButton {
  label: string;
  icon?: string;
  class?: string;
  show?: boolean; // condition d’affichage
  action: () => void;
}