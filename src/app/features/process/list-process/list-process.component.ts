import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ProcessService } from '../../../core/services/process/process.service';
import { GoBackComponent } from '../../../shared/components/go-back/go-back.component';

@Component({
  selector: 'app-list-process',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, GoBackComponent],
  templateUrl: './list-process.component.html',
  styleUrl: './list-process.component.scss'
})
export class ListProcessComponent {
  processService = inject(ProcessService);
  router = inject(Router);
  processes: any[] = [];
  displayedColumns: string[] = ['name', 'niveau', 'buName', 'parentName'];

  ngOnInit(): void {
    this.fetchProcesses();
  }

  fetchProcesses(): void {
    this.processService.getAll().subscribe((data: any[]) => {
      this.processes = data;
    });
  }

  navToCreate() {
    this.router.navigate(['reglages', 'process', 'create']);
  }

  navToEdit(id: string) {
    this.router.navigate(['reglages', 'process', id]);
  }
}
