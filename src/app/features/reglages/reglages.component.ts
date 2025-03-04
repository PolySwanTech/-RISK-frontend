import { Component, ChangeDetectorRef } from '@angular/core';
import { EntiteResponsable } from '../../core/models/EntiteResponsable';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { AddEntityDialogComponent } from './add-entity-dialog/add-entity-dialog.component';


const TREE_DATA: EntiteResponsable[] = [
  new EntiteResponsable(1, 'US', true,
    [
      new EntiteResponsable(2, 'FIN', true, [
        new EntiteResponsable(2, 'FR', true,
          [
            new EntiteResponsable(3, 'FIN', true),
            new EntiteResponsable(4, 'RH', false),
            new EntiteResponsable(5, 'DEV', false),
          ]),
      ]),
      new EntiteResponsable(1, 'RH', false),
      new EntiteResponsable(3, 'IT', false),
    ]),
  new EntiteResponsable(2, 'FR', true,
    [
      new EntiteResponsable(3, 'FIN', true),
      new EntiteResponsable(4, 'RH', false),
      new EntiteResponsable(5, 'DEV', false),
    ]),
];


@Component({
  selector: 'app-reglages',
  imports: [CommonModule, MatTreeModule, MatButtonModule,
    MatIconModule, MatDialogModule],
  templateUrl: './reglages.component.html',
  styleUrl: './reglages.component.scss'
})
export class ReglagesComponent {



  createNode(node: EntiteResponsable) {
    const dialogRef = this.dialog.open(AddEntityDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If a name was provided, create a new entity
        const newNode = new EntiteResponsable(1, result, true); // Create new entity with the provided name
        node.children.push(newNode); // Add the new entity to the parent
        this.changeDetectorRef.markForCheck();  // This triggers change detection
      }
    });  // This triggers the change detection
  }

  dataSource = TREE_DATA;

  childrenAccessor = (node: EntiteResponsable) => node.children ?? [];

  hasChild = (_: number, node: EntiteResponsable) => !!node.children && node.children.length > 0;

  constructor(private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }

}
