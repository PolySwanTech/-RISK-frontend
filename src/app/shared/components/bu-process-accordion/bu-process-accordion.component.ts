import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { BusinessUnit } from '../../../core/models/BusinessUnit';

export interface ProcessNode {
  id: string;
  name: string;
  children?: ProcessNode[]; // les process
}

@Component({
  selector: 'app-bu-process-accordion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatListModule],
  templateUrl: './bu-process-accordion.component.html',
  styleUrls: ['./bu-process-accordion.component.scss']
})
export class BuProcessAccordionComponent {
  @Input() data: BusinessUnit[] = [];
  @Output() processSelected = new EventEmitter<ProcessNode>();
  @Output() buSelected = new EventEmitter<BusinessUnit>();

  view: 'bu' | 'process' = 'bu';
  currentBU: BusinessUnit | null = null;
  breadcrumb: { name: string }[] = [];

  get breadcrumbDisplay(): string {
    return this.breadcrumb.map(item => item.name).join(' > ');
  }

  enterBu(bu: BusinessUnit) {
    this.currentBU = bu;
    console.log('BU selected:', bu);
    this.buSelected.emit(bu);
    this.view = 'process';
    this.breadcrumb = [{ name: bu.name }];
  }

  back() {
    this.view = 'bu';
    this.currentBU = null;
    this.breadcrumb = [];
  }

  selectProcess(p: ProcessNode) {
    console.log('Process selected:', p);
    this.processSelected.emit(p);
  }

  jumpTo(index: number) {
    if (index === 0) this.view = 'process';
    this.breadcrumb = this.breadcrumb.slice(0, index + 1);
  }
}