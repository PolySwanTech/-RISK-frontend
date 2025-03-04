import { Component } from '@angular/core';
import { EntiteResponsable } from '../../core/models/EntiteResponsable';
import { CommonModule } from '@angular/common';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';


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
  imports: [CommonModule, MatTreeModule,MatButtonModule, MatIconModule],
  templateUrl: './reglages.component.html',
  styleUrl: './reglages.component.scss'
})
export class ReglagesComponent {

  createNode(node : EntiteResponsable){
    const new_node = new EntiteResponsable(1, 'US', true)
    node.children.push(new_node);
  }

  dataSource = TREE_DATA;

  childrenAccessor = (node: EntiteResponsable) => node.children ?? [];

  hasChild = (_: number, node: EntiteResponsable) => !!node.children && node.children.length > 0;

}
