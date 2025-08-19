import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface MappingType {
  id: string;
  title: string;
  description: string;
  color : string;
  icon: string;
}

@Component({
  selector: 'app-choose-type-carto',
  imports: [CommonModule, FormsModule],
  templateUrl: './choose-type-carto.component.html',
  styleUrl: './choose-type-carto.component.scss'
})
export class ChooseTypeCartoComponent {

  @Output() nextStep = new EventEmitter<void>();

  steps = [
    'Type de cartographie',
    'Sélection',
    'Choix de cartographie',
    'Évaluation',
    'Résultats'
  ];

  activeStep = 0;

  mappingTypes: MappingType[] = [
    {
      id: 'brute',
      title: 'Cartographie brute',
      description: 'Évaluation initiale des risques sans mesures de contrôle',
      color: '#e8f0ff', // bleu clair
      icon: 'fas fa-layer-group'
    },
    {
      id: 'nette',
      title: 'Cartographie nette',
      description: 'Évaluation après application des contrôles existants',
      color: '#e9f9f0', // vert clair
      icon: 'fas fa-shield-alt'
    },
    {
      id: 'globale',
      title: 'Cartographie globale',
      description: 'Vue d’ensemble de tous les risques identifiés',
      color: '#f8e9fc', // violet clair
      icon: 'fas fa-globe'
    }
  ];

  selectedType: string | null = null;

  selectType(type: string) {
    this.selectedType = type;
    this.nextStep.emit();
  }

}
