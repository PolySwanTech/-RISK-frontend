import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-snapshot-dialog',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './snapshot-dialog.component.html',
  styleUrls: ['./snapshot-dialog.component.scss']
})
export class SnapshotDialogComponent implements OnInit {
  diffs: { key: string, oldValue: any, newValue: any }[] = [];

  labelMap: { [key: string]: string } = {
    comments: 'Commentaire'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SnapshotDialogComponent>
  ) { }

  ngOnInit() {
    const oldObj = this.data.oldSnapshot ? JSON.parse(this.data.oldSnapshot) : {};
    const newObj = this.data.newSnapshot ? JSON.parse(this.data.newSnapshot) : {};

    this.diffs = this.compareObjects(oldObj, newObj);
  }

  compareObjects(oldObj: any, newObj: any): { key: string, oldValue: any, newValue: any }[] {
    const diffs: { key: string, oldValue: any, newValue: any }[] = [];

    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    allKeys.forEach(key => {
      const oldVal = oldObj[key];
      const newVal = newObj[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diffs.push({
          key,
          oldValue: this.formatValue(oldVal),
          newValue: this.formatValue(newVal)
        });
      }
    });

    return diffs;
  }

  formatValue(val: any): string {
    if (val === null || val === undefined) return '(vide)';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return val;
  }

  close(): void {
    this.dialogRef.close();
  }
}
