import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CsvService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/csv`;

  /**
   * Importe un fichier CSV dans la table spécifiée
   * Appelle la fonction appropriée selon la table sélectionnée
   */
  importToTable(tableName: string, file: File): Observable<any> {
    switch (tableName) {
      case 'business_units':
        return this.importBusinessUnits(file);
      
      case 'processus':
        return this.importProcessus(file);
      
      case 'risk_referentiel':
        return this.importRiskReferentiel(file);
      
      case 'evenements_redoutes':
        return this.importEvenementsRedoutes(file);
      
      case 'incidents':
        return this.importIncidents(file);
      
      case 'controles':
        return this.importControles(file);
      
      case 'attenuation_metrics':
        return this.importAttenuationMetrics(file);
      
      case 'sma_loss':
        return this.importSmaLoss(file);
      
      case 'sma_result':
        return this.importSmaResult(file);
      
      default:
        throw new Error(`Table "${tableName}" non reconnue`);
    }
  }

  /**
   * Import des Business Units
   * Colonnes attendues: lm, name, evaluationfrequency
   */
  private importBusinessUnits(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/import/business-units`, formData);
  }

  /**
   * Import des Processus
   * Colonnes attendues: bu_id, parent_id, name
   */
  private importProcessus(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/import/processus`, formData);
  }

  /**
   * Import du Référentiel de Risque
   * Colonnes attendues: libelle, description, category
   */
  private importRiskReferentiel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/import/risk-referentiel`, formData);
  }

  /**
   * Import des Évènements Redoutés
   * Colonnes attendues: process_id, risk_referentiel_id, libelle, description
   */
  private importEvenementsRedoutes(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/import/evenements-redoutes`, formData);
  }

  /**
   * Import des Incidents
   * Colonnes attendues: title, state, declared_at, detected_at, survenue_at, 
   *                     closed_at, cause_id, risk_id, comments, location
   */
  private importIncidents(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/import/incidents`, formData);
  }

  /**
   * Import des Contrôles
   * Colonnes attendues: libelle, description, control_type, frequency, level, risk_id
   */
  private importControles(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/import/controles`, formData);
  }

  /**
   * Import des Mesures d'Atténuation
   * Colonnes attendues: risk_id, description, libelle, type
   */
  private importAttenuationMetrics(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/import/attenuation-metrics`, formData);
  }

  /**
   * Import des SMA Loss
   * Colonnes attendues: lossyear, amount
   */
  private importSmaLoss(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/import/sma-loss`, formData);
  }

  /**
   * Import des SMA Result
   * Colonnes attendues: lossyear, bi, bic, ilm, orc, rwa
   */
  private importSmaResult(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/import/sma-result`, formData);
  }

  /**
   * Valide le format et les colonnes du fichier CSV
   */
  validateCsvFile(file: File, expectedColumns: string[]): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const lines = content.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            resolve({ 
              valid: false, 
              error: 'Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données' 
            });
            return;
          }
          
          // Vérifier les colonnes
          const headers = lines[0].split(',').map(h => h.trim());
          const missingColumns = expectedColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            resolve({
              valid: false,
              error: `Colonnes manquantes: ${missingColumns.join(', ')}`
            });
            return;
          }
          
          resolve({ valid: true });
        } catch (error) {
          resolve({ 
            valid: false, 
            error: 'Erreur lors de l\'analyse du fichier CSV' 
          });
        }
      };
      
      reader.onerror = () => {
        resolve({ 
          valid: false, 
          error: 'Erreur lors de la lecture du fichier' 
        });
      };
      
      reader.readAsText(file);
    });
  }
}