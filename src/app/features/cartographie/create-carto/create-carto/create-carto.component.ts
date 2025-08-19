import { Component, inject } from '@angular/core';
import { EntitiesService } from '../../../../core/services/entities/entities.service';
import { CartoService } from '../../../../core/services/carto/carto.service';
import { Router } from '@angular/router';
import { BusinessUnit } from '../../../../core/models/BusinessUnit';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-carto',
  standalone: true,
  imports: [FormsModule ,CommonModule],
  templateUrl: './create-carto.component.html',
  styleUrl: './create-carto.component.scss'
})
export class CreateCartoComponent {
  private cartoService = inject(CartoService);
  router = inject(Router);
  private businessUnitService = inject(EntitiesService);
  businessUnits: BusinessUnit[] = [];
  selectedBuId: string | null = null;
  cartoName: string = '';

  ngOnInit() {
    this.businessUnitService.loadEntities().subscribe({
      next: (data) => {
        this.businessUnits = data;
        console.log(this.businessUnits)

      },
      error: (error) => {
        console.error('Error fetching business units:', error);
      }
    });
  }

  createCarto() {
    const name = this.cartoName?.trim();
    if (!this.selectedBuId || !name) return;
    const payload = { name, buId: this.selectedBuId };
    this.cartoService.create(payload).subscribe({
      next: () => this.router.navigate(['/cartographie/evaluation']),
      error: (err) => console.error('Erreur création carto', err),
    });
  }

}
