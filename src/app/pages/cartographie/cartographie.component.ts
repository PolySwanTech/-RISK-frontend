import { Component, inject, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { ListProcessComponent } from '../../features/process/list-process/list-process.component';

@Component({
  selector: 'app-cartographie',
  imports: [MatCardModule, CommonModule, FormsModule, GoBackComponent,
    MatPaginatorModule, RouterModule, ListProcessComponent,
    MatIconModule, MatTableModule, MatButtonModule, MatMenuModule,
    MatFormFieldModule, MatOptionModule, MatSelectModule, ReactiveFormsModule, MatTooltipModule, MatSuffix],
  templateUrl: './cartographie.component.html',
  styleUrls: ['./cartographie.component.scss']
})
export class CartographieComponent implements OnInit {

  loading = false;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private businessUnitService = inject(EntitiesService);

  selectedYear: number | null = null;
  selectedBu: BusinessUnit | null = null;

  businessUnits: BusinessUnit[] = [];
  years: number[] = [];

  goBackButtons = [
    {
      label: 'Créer une cartographie',
      icon: 'add',
      class: 'btn-primary',
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

  goCreate() {
    if (this.selectedBu)
      this.router.navigate(['cartographie', 'create'], { queryParams: { buId: this.selectedBu.id, year: this.selectedYear } });
  }

  onBuChange(bu: BusinessUnit) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { buId: bu.id },
      queryParamsHandling: 'merge' // garde les autres query params existants
    });
  }
  
  viewCarto() {
    // if(this.selectedBuId){
    //   this.riskService.getEvaluationsByBu(this.selectedBuId).subscribe(
    //     resp => {
    //     }
    //   )
    // }
    // this.snackBarService.info(`Consultation de la carto ${this.selectedBuId} - ${this.selectedYear}`);
  }

  addCarto() {
    this.router.navigate(['cartographie', 'create']); // route création
  }
}
