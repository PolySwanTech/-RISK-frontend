import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-date-range-picker',
  imports: [MatButtonModule, MatTableModule, MatSortModule, MatDatepickerModule, CommonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatNativeDateModule, FormsModule, MatIconModule],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss'
})
export class DateRangePickerComponent {
  @Input() label: string = 'Période';
  @Input() defaultRange: { start: Date, end: Date } | null = null;
  @Output() dateRangeSelected = new EventEmitter<{ start: Date; end: Date }>();

  @Input() removeField: boolean = false;
  @Output() removeFieldClicked = new EventEmitter<void>();

  form!: FormGroup;

  fb = inject(FormBuilder);

  ngOnInit(): void {
    this.form = this.fb.group({
      selectedRange: this.fb.group({
        start: null,
        end: null
      })
    });

    if (this.defaultRange) {
      this.form.patchValue({ selectedRange: this.defaultRange });
    }

    this.form.get('selectedRange')!.valueChanges.subscribe(({ start, end }) => {
      if (start && end) {
        this.dateRangeSelected.emit({
          start: start,
          end: end
        });
      }
    });
  }
}
