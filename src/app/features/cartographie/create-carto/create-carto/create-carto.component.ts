import { Component, inject } from '@angular/core';
import { EntitiesService } from '../../../../core/services/entities/entities.service';
import { CartoService } from '../../../../core/services/carto/carto.service';
import { Router } from '@angular/router';
import { BusinessUnit } from '../../../../core/models/BusinessUnit';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cartography } from '../../../../core/models/Cartography';

type CreationMode = 'blank' | 'fromExisting' | null;


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
  years: number[] = [];
  existingCartos: Cartography[] = [];

  selectedBuId: string | null = null;
  mode: CreationMode = null;
  selectedSourceCartoId: string | null = null;
  selectedYear: number | null = null;
  cartoName: string = '';
  

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    this.businessUnitService.loadEntities().subscribe({
      next: (data) => this.businessUnits = data,
      error: (error) => console.error('Error fetching business units:', error)
    });

    this.cartoService.getAll().subscribe({
      next: (cartos) => this.existingCartos = cartos,
      error: (err) => console.error('Error fetching cartos:', err)
    });
  }

  createCarto() {
    const name = this.cartoName?.trim();
    if (!this.selectedBuId || !name) return;
    const payload = { name, buId: this.selectedBuId, exerciceYear: this.selectedYear!};
    this.cartoService.create(payload).subscribe({
      next: () => this.router.navigate(['/cartographie/evaluation']),
      error: (err) => console.error('Erreur création carto', err),
    });
  }

  get canContinue(): boolean {
    return !!this.selectedBuId && !!this.selectedYear && this.cartoName.trim().length > 0;
  }

  onSourceCartoChange() {
  const carto = this.existingCartos.find(c => c.id === this.selectedSourceCartoId);
  if (carto) {
    this.selectedBuId = carto.buId || null;
    this.selectedYear = carto.exerciceYear + 1;
    this.cartoName = `Copie de ${carto.name}`;
  }
}

    onContinue() {
    if (!this.canContinue) return;

    if (this.mode === 'fromExisting') {
      // Ici deux options :
      // 1) Naviguer vers une page de “duplication”/“chargement” (si déjà prévue)
      // 2) Appeler un endpoint de clone si tu en as un (non fourni pour l’instant)
      // Pour l’instant, simple navigation d’exemple :
      this.router.navigate(['/cartographie/consulter'], {
        queryParams: { sourceId: this.selectedSourceCartoId }
      });
      return;
    }
    const payload = { name: this.cartoName.trim(), buId: this.selectedBuId!, exerciceYear: this.selectedYear! };
    this.cartoService.create(payload).subscribe({
      next: (createdIdOrDto) => {
        this.router.navigate(['/cartographie/consulter']);
      },
      error: (err) => console.error('Erreur création carto', err),
    });
  }

}
