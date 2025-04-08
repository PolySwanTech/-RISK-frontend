import { Component, Input, LOCALE_ID } from '@angular/core';
import { Impact } from '../../../core/models/Impact';
import { MatCard, MatCardModule } from '@angular/material/card';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';  // Import the French locale


// Register the French locale
registerLocaleData(localeFr, 'fr');


@Component({
  selector: 'app-impact-card',
  imports: [MatCardModule, DatePipe, CurrencyPipe],
  templateUrl: './impact-card.component.html',
  styleUrl: './impact-card.component.scss', 
  providers : [
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
})
export class ImpactCardComponent {

  @Input() impact: Impact | undefined;
}
