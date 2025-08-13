import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-field-with-tooltip',
  imports: [MatIconModule, MatTooltipModule, MatFormFieldModule],
  templateUrl: './field-with-tooltip.component.html',
  styleUrl: './field-with-tooltip.component.scss'
})
export class FieldWithTooltipComponent {
  @Input() label!: string;
  @Input() placeholder?: string;
  @Input() tooltip?: string;
  @Input() formControl: FormControl = new FormControl();
  @Input() appearance: 'fill' | 'outline' = 'fill';
}
