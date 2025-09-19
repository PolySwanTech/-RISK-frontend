import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-process-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <mat-list dense>
      <ng-container *ngFor="let node of nodes">
        <mat-list-item>
          <div mat-line>{{ node.name }}</div>

          <button mat-icon-button *ngIf="node.children?.length"
                  (click)="toggle(node); $event.stopPropagation()">
            <mat-icon>{{ expanded.has(node) ? 'expand_less' : 'expand_more' }}</mat-icon>
          </button>
        </mat-list-item>

        <!-- sous-liste récursive attachée au node -->
        <div *ngIf="expanded.has(node)" class="children">
          <app-process-list [nodes]="node.children" [level]="level + 1"></app-process-list>
        </div>
      </ng-container>
    </mat-list>
  `,
  styles: [`
    .children {
      margin-left: 20px;
      border-left: 1px dashed #ccc;
      padding-left: 10px;
    }
  `]
})
export class ProcessListComponent {
  @Input() nodes: any[] = [];
  @Input() level = 0;

  expanded = new Set<any>();

  toggle(node: any) {
    if (this.expanded.has(node)) {
      this.expanded.delete(node);
    } else {
      this.expanded.add(node);
    }
  }
}