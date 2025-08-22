import { Component, inject } from '@angular/core';
import { Cartography } from '../../../../core/models/Cartography';
import { CartoService } from '../../../../core/services/carto/carto.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EntitiesService } from '../../../../core/services/entities/entities.service';
import { BusinessUnit } from '../../../../core/models/BusinessUnit';

@Component({
  selector: 'app-select-carto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-carto.component.html',
  styleUrl: './select-carto.component.scss'
})
export class SelectCartoComponent {

  private cartoService = inject(CartoService);
  private entitiesService = inject(EntitiesService);
  router = inject(Router);

  businessUnits: BusinessUnit[] = [];
  cartographies: Cartography[] = [];
  selectedCarto: Cartography | null = null;

  ngOnInit() {
    this.entitiesService.loadEntities().subscribe({
      next: (data) => {
        this.businessUnits = data; // on garde l'objet complet
      },
      error: (error) => {
        console.error('Error fetching business units:', error);
      }
    });
  }

  onBusinessUnitChange(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  const buId = selectElement.value;

  if (!buId) return; // sécurité si rien sélectionné

  this.cartoService.getAllGroupedByBu(buId).subscribe({
    next: (cartosByBu) => {
      this.cartographies = cartosByBu[buId] || [];
    },
    error: (error) => {
      console.error('Error fetching cartographies for BU:', error);
    }
  });
}

onCartoChange(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  const cartoId = selectElement.value;
  this.selectedCarto = this.cartographies.find(c => c.id === cartoId) || null;
}

}
