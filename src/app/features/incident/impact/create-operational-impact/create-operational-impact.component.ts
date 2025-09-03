import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- Financier ---
interface FinancialImpactDetails {
  amountType: '' | 'REEL' | 'ESTIME' | 'PREVISIONNEL' | 'BUDGET';
  accountingDate: string; // YYYY-MM-DD
  amount: string;
}
interface FinancialImpact {
  id: number;
  title: string;
  businessLine: string;        // ✅ Business line (déjà présent côté financier)
  type: string;
  description: string;
  accountingReference: string;
  details: FinancialImpactDetails[]; // ✅ plusieurs lignes
}

// --- Non financier (mise à jour) ---
interface NonFinancialImpact {
  id: number;
  title: string;
  businessLine: string;        // ✅ ajouté
  type: string;
  description: string;
  amountType: 'ESTIME';        // ✅ fixé
  amount: string;              // ✅ ajouté
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
  // Typologies
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

  // À brancher plus tard sur ton service si besoin
  businessLines = ['Retail', 'Corporate', 'Institutionnel', 'Assurance', 'Autre'];

  // State
  formData: FormData = {
    financialImpacts: [],
    nonFinancialImpacts: [],
  };

  errors: Errors = {};
  trackById = (_: number, item: { id: number }) => item.id;

  // ---------- Financier ----------
  addFinancialImpact() {
    this.formData = {
      ...this.formData,
      financialImpacts: [
        ...this.formData.financialImpacts,
        {
          id: Date.now(),
          title: '',
          businessLine: '',
          type: '',
          description: '',
          accountingReference: '',
          details: [{ amountType: '', accountingDate: '', amount: '' }],
        },
      ],
    };
  }

  addFinancialDetail(i: number) {
    this.formData.financialImpacts[i].details.push({ amountType: '', accountingDate: '', amount: '' });
  }

  removeFinancialDetail(i: number, j: number) {
    this.formData.financialImpacts[i].details.splice(j, 1);
  }

  // ---------- Non financier (nouveau modèle) ----------
  addNonFinancialImpact() {
    this.formData = {
      ...this.formData,
      nonFinancialImpacts: [
        ...this.formData.nonFinancialImpacts,
        {
          id: Date.now(),
          title: '',
          businessLine: '',   // ✅
          type: '',
          description: '',
          amountType: 'ESTIME', // ✅ fixé
          amount: '',           // ✅
        },
      ],
    };
  }

  removeItem(type: keyof FormData, id: number) {
    const list = (this.formData[type] as any[]) ?? [];
    this.formData = { ...this.formData, [type]: list.filter(it => it.id !== id) } as FormData;
  }

  // ---------- Validation ----------
  validateForm(): boolean {
    const newErrors: Errors = {};

    if (this.formData.financialImpacts.length === 0 && this.formData.nonFinancialImpacts.length === 0) {
      newErrors['impacts'] = 'Ajoutez au moins un impact (financier ou non financier).';
    }

    // Non financier
    this.formData.nonFinancialImpacts.forEach((imp, i) => {
      if (!imp.title || !imp.businessLine || !imp.type || !imp.description) {
        newErrors[`nonfinancial_${i}`] = 'Titre, Business Line, type et description sont requis.';
      }
      if (!imp.amount || isNaN(+imp.amount)) {
        newErrors[`nonfinancial_${i}`] = (newErrors[`nonfinancial_${i}`] ? newErrors[`nonfinancial_${i}`] + ' ' : '')
          + 'Montant (estimé) requis et numérique.';
      }
      if (imp.amountType !== 'ESTIME') {
        // au cas où quelqu’un modifie le DOM: on force côté code
        imp.amountType = 'ESTIME';
      }
    });

    // Financier
    this.formData.financialImpacts.forEach((imp, i) => {
      if (!imp.title || !imp.type || !imp.description || !imp.businessLine) {
        newErrors[`financial_${i}`] = 'Titre, Business Line, type et description sont requis.';
      }

      if (!imp.details.length) {
        newErrors[`financial_details_${i}`] = 'Ajoutez au moins un type de montant.';
      } else {
        const anyMissing = imp.details.some(d => !d.amountType || !d.accountingDate || !d.amount || isNaN(+d.amount));
        if (anyMissing) {
          newErrors[`financial_details_${i}`] = 'Tous les détails comptables (type/date/montant numérique) sont requis.';
        }
      }
    });

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  handleSubmit() {
    if (!this.validateForm()) return;
    console.log('Payload:', this.formData);
    alert('Impact opérationnel créé avec succès !');
    // TODO: appel API ici
  }

  onCancel() {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Toutes les données saisies seront perdues.')) {
      this.resetForm();
    }
  }

  resetForm() {
    this.formData = { financialImpacts: [], nonFinancialImpacts: [] };
    this.errors = {};
  }
}
