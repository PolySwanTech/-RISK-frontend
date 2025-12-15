import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsvService } from '../../core/services/csv/csv.service';

interface TableInfo {
  value: string;
  label: string;
  description: string;
  expectedColumns: string[];
}

@Component({
  selector: 'app-csv-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './csv-import.component.html',
  styleUrl: './csv-import.component.scss'
})
export class CsvImportComponent {
  selectedTable: string = '';
  selectedFile: File | null = null;
  isUploading: boolean = false;
  uploadMessage: string = '';
  uploadSuccess: boolean = false;

  private csvService = inject(CsvService);

  // Liste des tables disponibles avec leurs informations
  tables: TableInfo[] = [
    {
      value: 'business_units',
      label: 'Business Units',
      description: 'Import des unités métier (lm, name, evaluationfrequency)',
      expectedColumns: ['lm', 'name', 'evaluationfrequency']
    },
    {
      value: 'processus',
      label: 'Processus',
      description: 'Import des processus (bu_id, parent_id, name)',
      expectedColumns: ['bu_id', 'parent_id', 'name']
    },
    {
      value: 'risk_referentiel',
      label: 'Référentiel de Risque',
      description: 'Import du référentiel de risque (libelle, description, category)',
      expectedColumns: ['libelle', 'description', 'category']
    },
    {
      value: 'evenements_redoutes',
      label: 'Évènements Redoutés',
      description: 'Import des évènements redoutés (process_id, risk_referentiel_id, libelle, description)',
      expectedColumns: ['process_id', 'risk_referentiel_id', 'libelle', 'description']
    },
    {
      value: 'incidents',
      label: 'Incidents',
      description: 'Import des incidents (title, state, declared_at, detected_at, survenue_at, closed_at, cause_id, risk_id, comments, location)',
      expectedColumns: ['title', 'state', 'declared_at', 'detected_at', 'survenue_at', 'closed_at', 'cause_id', 'risk_id', 'comments', 'location']
    },
    {
      value: 'controles',
      label: 'Contrôles',
      description: 'Import des contrôles (libelle, description, control_type, frequency, level, risk_id)',
      expectedColumns: ['libelle', 'description', 'control_type', 'frequency', 'level', 'risk_id']
    },
    {
      value: 'attenuation_metrics',
      label: 'Mesures d\'Atténuation',
      description: 'Import des mesures d\'atténuation (risk_id, description, libelle, type)',
      expectedColumns: ['risk_id', 'description', 'libelle', 'type']
    },
    {
      value: 'sma_loss',
      label: 'SMA Loss',
      description: 'Import des pertes SMA (lossyear, amount)',
      expectedColumns: ['lossyear', 'amount']
    },
    {
      value: 'sma_result',
      label: 'SMA Result',
      description: 'Import des résultats SMA (lossyear, bi, bic, ilm, orc, rwa)',
      expectedColumns: ['lossyear', 'bi', 'bic', 'ilm', 'orc', 'rwa']
    }
  ];

  get selectedTableInfo(): TableInfo | undefined {
    return this.tables.find(t => t.value === this.selectedTable);
  }

  onTableSelect(table: string): void {
    this.selectedTable = table;
    this.uploadMessage = '';
    this.selectedFile = null;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Vérifier que c'est un fichier CSV
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        this.selectedFile = file;
        this.uploadMessage = '';
      } else {
        this.uploadMessage = 'Veuillez sélectionner un fichier CSV valide';
        this.uploadSuccess = false;
        this.selectedFile = null;
      }
    }
  }

  async onUpload(): Promise<void> {
    if (!this.selectedTable) {
      this.uploadMessage = 'Veuillez sélectionner une table';
      this.uploadSuccess = false;
      return;
    }

    if (!this.selectedFile) {
      this.uploadMessage = 'Veuillez sélectionner un fichier';
      this.uploadSuccess = false;
      return;
    }

    this.isUploading = true;
    this.uploadMessage = '';

    try {
      // TODO: Appeler le service CSV ici
      // Exemple :
      // await this.csvService.importToTable(this.selectedTable, this.selectedFile).toPromise();
      
      // Simulation pour l'instant
      this.csvService.importToTable(this.selectedTable, this.selectedFile).subscribe({
        next: () => {
          this.uploadMessage = `Fichier importé avec succès dans la table "${this.selectedTableInfo?.label}"`;
          this.uploadSuccess = true;
          this.selectedFile = null; 
        }
      });
      // Réinitialiser l'input file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      this.uploadMessage = `Erreur lors de l'import : ${error}`;
      this.uploadSuccess = false;
    } finally {
      this.isUploading = false;
    }
  }

  resetForm(): void {
    this.selectedTable = '';
    this.selectedFile = null;
    this.uploadMessage = '';
    this.uploadSuccess = false;
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}