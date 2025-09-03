import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type PriorityValue = 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';

interface FinancialImpactDetails {
  amountType: '' | 'REEL' | 'ESTIME' | 'PREVISIONNEL' | 'BUDGET';
  accountingDate: string; // YYYY-MM-DD
  amount: string;
}

interface FinancialImpact {
  id: number;
  title: string;
  priority: PriorityValue;
  type: string;
  description: string;
  details: FinancialImpactDetails;
}

interface NonFinancialImpact {
  id: number;
  title: string;
  priority: PriorityValue;
  type: string;
  description: string;
  measurabilityIndicator: string;
}

interface FormData {
  financialImpacts: FinancialImpact[];
  nonFinancialImpacts: NonFinancialImpact[];
}

type Errors = Record<string, string>;

@Component({
  selector: 'app-create-operational-impact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-operational-impact.component.html',
  styleUrl: './create-operational-impact.component.scss',
})
export class CreateOperationalImpactComponent {
  // Options
  priorityOptions = [
    { value: 'FAIBLE' as const,   label: 'Faible',   badge: 'badge--faible' },
    { value: 'MOYENNE' as const,  label: 'Moyenne',  badge: 'badge--moyenne' },
    { value: 'ELEVEE' as const,   label: 'Élevée',   badge: 'badge--elevee' },
    { value: 'CRITIQUE' as const, label: 'Critique', badge: 'badge--critique' },
  ];

  financialImpactTypes = [
    'Impact sur les revenus',
    'Impact sur les coûts',
    'Impact sur les investissements',
    'Impact sur les provisions',
    'Impact sur les amortissements',
    'Autres impacts comptables',
  ];

  nonFinancialImpactTypes = [
    'Amélioration de la qualité',
    'Satisfaction client',
    'Efficacité opérationnelle',
    'Conformité réglementaire',
    'Innovation',
    'Image de marque',
    'Compétences collaborateurs',
    'Réduction des risques',
  ];

  amountTypes = [
    { value: 'REEL' as const,        label: 'Montant réel' },
    { value: 'ESTIME' as const,      label: 'Montant estimé' },
    { value: 'PREVISIONNEL' as const,label: 'Montant prévisionnel' },
    { value: 'BUDGET' as const,      label: 'Budget alloué' },
  ];

  // State
  formData: FormData = {
    financialImpacts: [],
    nonFinancialImpacts: [],
  };

  errors: Errors = {};

  // Helpers
  trackById = (_: number, item: { id: number }) => item.id;

  getBadge(p: PriorityValue | ''): string {
    switch (p) {
      case 'FAIBLE': return 'badge--faible';
      case 'MOYENNE': return 'badge--moyenne';
      case 'ELEVEE': return 'badge--elevee';
      case 'CRITIQUE': return 'badge--critique';
      default: return '';
    }
  }
  getPriorityLabel(p: PriorityValue | ''): string {
    return this.priorityOptions.find(o => o.value === p)?.label ?? '';
  }

  // Actions
  addFinancialImpact() {
    this.formData = {
      ...this.formData,
      financialImpacts: [
        ...this.formData.financialImpacts,
        {
          id: Date.now(),
          title: '',
          priority: 'MOYENNE',
          type: '',
          description: '',
          details: { amountType: '', accountingDate: '', amount: '' },
        },
      ],
    };
  }

  addNonFinancialImpact() {
    this.formData = {
      ...this.formData,
      nonFinancialImpacts: [
        ...this.formData.nonFinancialImpacts,
        {
          id: Date.now(),
          title: '',
          priority: 'MOYENNE',
          type: '',
          description: '',
          measurabilityIndicator: '',
        },
      ],
    };
  }

  removeItem(type: keyof FormData, id: number) {
    const list = (this.formData[type] as any[]) ?? [];
    this.formData = { ...this.formData, [type]: list.filter(it => it.id !== id) } as FormData;
  }

  // Validation & submit
  validateForm(): boolean {
    const newErrors: Errors = {};

    if (this.formData.financialImpacts.length === 0 && this.formData.nonFinancialImpacts.length === 0) {
      newErrors['impacts'] = 'Ajoutez au moins un impact (financier ou non financier).';
    }

    this.formData.nonFinancialImpacts.forEach((imp, i) => {
      if (!imp.title || !imp.priority || !imp.type || !imp.description) {
        newErrors[`nonfinancial_${i}`] = 'Titre, priorité, type et description sont requis.';
      }
    });

    this.formData.financialImpacts.forEach((imp, i) => {
      if (!imp.title || !imp.priority || !imp.type || !imp.description) {
        newErrors[`financial_${i}`] = 'Titre, priorité, type et description sont requis.';
      }
      if (!imp.details.amountType || !imp.details.accountingDate || !imp.details.amount) {
        newErrors[`financial_details_${i}`] = 'Tous les détails comptables sont requis.';
      }
    });

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  handleSubmit() {
    if (this.validateForm()) {
      console.log("Payload:", this.formData);
      alert('Impact opérationnel créé avec succès !');
      // TODO: appel API ici
    }
  }

  onCancel() {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Toutes les données saisies seront perdues.')) {
      this.resetForm();
    }
  }

  resetForm() {
    this.formData = {
      financialImpacts: [],
      nonFinancialImpacts: [],
    };
    this.errors = {};
  }
}
