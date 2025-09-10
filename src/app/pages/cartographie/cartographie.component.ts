import { Component, inject, OnInit } from '@angular/core';
import { Cartography } from '../../core/models/Cartography';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BusinessUnit } from '../../core/models/BusinessUnit';
import { EntitiesService } from '../../core/services/entities/entities.service';
import { MatFormFieldModule, MatSuffix } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SnackBarService } from '../../core/services/snack-bar/snack-bar.service';

@Component({
  selector: 'app-cartographie',
  imports: [MatCardModule, CommonModule, FormsModule, GoBackComponent,
    MatPaginatorModule, RouterModule,
    MatIconModule, MatTableModule, MatButtonModule, MatMenuModule, 
    MatFormFieldModule, MatOptionModule, MatSelectModule, ReactiveFormsModule, MatTooltipModule, MatSuffix],
  templateUrl: './cartographie.component.html',
  styleUrls: ['./cartographie.component.scss']
})
export class CartographieComponent implements OnInit {

  loading = false;

  private router = inject(Router);
  private businessUnitService = inject(EntitiesService);
  private snackBarService = inject(SnackBarService);

  selectedYear: number | null = null;
  selectedBuId: string | null = null;

  businessUnits: BusinessUnit[] = [];
  years: number[] = [];

  goBackButtons = [
    {
      label: 'Rafraichir',
      icon: 'refresh',
      class: 'btn-primary',
      show: true,
      action: () => this.ngOnInit()
    },
    {
      label: 'Créer une cartographie',
      icon: 'add',
      class: 'btn-secondary',
      show: true,
      action: () => this.addCarto()
    }
  ];

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    this.businessUnitService.loadEntities().subscribe({
      next: (data) => this.businessUnits = data,
      error: (error) => console.error('Error fetching business units:', error)
    });
  }

  goCreate() { this.router.navigate(['cartographie', 'create'], {queryParams : { buId: this.selectedBuId, year: this.selectedYear }}); }

  openDuplicate(row: Cartography) {
    // const ref = this.dialog.open(CartoDuplicateDialogComponent, {
    //   width: '460px',
    //   data: { source: row }
    // });

    // ref.afterClosed().subscribe(result => {
    //   if (!result) return;
    //   this.service.duplicateFrom(row, result).subscribe(newCarto => {
    //     // rafraîchir la liste et naviguer vers la nouvelle carto
    //     this.fetch();
    //     this.router.navigate(['/carto', newCarto.id]);
    //   });
    // });
  }

  viewCarto() {
    this.snackBarService.info(`Consultation de la carto ${this.selectedBuId} - ${this.selectedYear}`);
  }

  addCarto() {
    this.router.navigate(['cartographie', 'create']); // route création
  }
}
