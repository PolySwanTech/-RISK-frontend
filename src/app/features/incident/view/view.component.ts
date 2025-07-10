import { Component, inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { Incident } from '../../../core/models/Incident';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateImpactPopUpComponent } from '../create-impact-pop-up/create-impact-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { ImpactCardComponent } from '../impact-card/impact-card.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { Impact, ImpactCreateDto } from '../../../core/models/Impact';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { SuiviIncidentService } from '../../../core/services/suivi-incident/suivi-incident.service';
import { SuiviIncident } from '../../../core/models/SuiviIncident';
import { HttpClient } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FichiersComponent } from "../../../shared/components/fichiers/fichiers.component";
import { State } from '../../../core/enum/state.enum';
import { RiskCategoryService } from '../../../core/services/risk/risk-category.service';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { CreateActionPlanDialogComponent } from '../../action-plan/create-action-plan-dialog/create-action-plan-dialog.component';
import { ImpactService } from '../../../core/services/impact/impact.service';

// Interface pour les fichiers attachés
interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url?: string;
}

@Component({
  selector: 'app-view',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule, CurrencyPipe, DatePipe,
    MatGridListModule, MatButtonModule, ImpactCardComponent, MatFormFieldModule,
    MatInputModule, GoBackComponent, MatTooltipModule, CommonModule, FichiersComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
})
export class ViewComponent implements OnInit {
  private incidentService = inject(IncidentService);
  private impactService = inject(ImpactService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  private suiviIncidentService = inject(SuiviIncidentService);
  private entitiesService = inject(EntitiesService);



  incident: Incident | undefined
  totalAmount = 0;
  userRole: string | undefined;
  userTeam: string | undefined;
  username: string | undefined;
  canClose: boolean = false;
  message: string = "";
  idIncident: string = "";
  suivi: SuiviIncident[] = []

  // Propriétés pour la gestion des fichiers
  attachedFiles: AttachedFile[] = [];
  isDragOver = false;

  businessUnits: EntiteResponsable[] = [];

  ngOnInit(): void {
    this.entitiesService.loadEntities().subscribe(entities => {
      this.businessUnits = entities;
    });
    this.idIncident = this.route.snapshot.params['id'];
    this.loadIncident(this.idIncident);
    this.loadAttachedFiles(this.idIncident);
    this.suiviIncidentService.getSuiviIncidentById(this.idIncident).subscribe(
      (res) => {
        this.suivi = res;
      },
      (err) => {
        console.error("Erreur lors du chargement du suivi de l'incident :", err);
      }
    );
    this.message = "";
  }

  loadIncident(id: string): void {
    this.incidentService.getIncidentById(id).subscribe((incident) => {
      this.incident = incident;
      console.log("Incident chargé :", this.incident);
      this.extractTokenInfo();
      this.checkCloseAuthorization();
    });


    this.impactService.sum(id).subscribe(
      result => this.totalAmount = result
    )
  }

  loadAttachedFiles(incidentId: string): void {
    // TODO: Remplacer par votre service de fichiers
    // this.fileService.getFilesByIncidentId(incidentId).subscribe(files => {
    //   this.attachedFiles = files;
    // });

    // Données de test - à supprimer quand le service sera implémenté
    this.attachedFiles = [
      {
        id: '1',
        name: 'rapport-incident.pdf',
        size: 2458624, // 2.4 MB
        type: 'application/pdf',
        uploadedAt: new Date('2025-05-24')
      },
      {
        id: '2',
        name: 'capture-ecran-serveur.png',
        size: 876544, // 856 KB
        type: 'image/png',
        uploadedAt: new Date('2025-05-26')
      },
      {
        id: '3',
        name: 'capture-ecran-serveur.png',
        size: 876544, // 856 KB
        type: 'image/png',
        uploadedAt: new Date('2025-05-22')
      },
      {
        id: '4',
        name: 'capture-ecran-serveur.png',
        size: 876544, // 856 KB
        type: 'image/png',
        uploadedAt: new Date('2025-05-30')
      },
      {
        id: '5',
        name: 'capture-ecran-serveur.png',
        size: 876544, // 856 KB
        type: 'image/png',
        uploadedAt: new Date('2025-05-18')
      }
    ];
  }

  extractTokenInfo(): void {
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.warn("Aucun token trouvé");
      return;
    }

    const base64Payload = token.split('.')[1];
    const jsonPayload = new TextDecoder().decode(
      Uint8Array.from(atob(base64Payload), c => c.charCodeAt(0))
    );
    const payload = JSON.parse(jsonPayload);
    this.userRole = payload.roles?.[0]?.role_name;
    // this.userTeam = payload.roles?.[0]?.team_id;
    this.username = payload.username;

  }

  checkCloseAuthorization(): void {
    this.canClose = this.userRole === 'VALIDATEUR';
  }

  normalize(str?: string): string {
    return str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() || '';
  }

  getState() {
    if (this.incident) {
      return State[this.incident.state.toString() as keyof typeof State]
    }
    return "Inconnu"
  }

  changeStatus(): void {
    if (this.incident) {
      switch (this.incident.state) {
        case State.DRAFT:
          this.incident.state = State.VALIDATE;
          break;
        case State.VALIDATE:
          this.incident.state = State.PROCESS;
          break;
        case State.PROCESS:
          this.incident.state = State.CLOSED;
          break;
        case State.CLOSED:
          this.confirmService.openConfirmDialog("Incident déjà clôturé", "L'incident est déjà clôturé, vous ne pouvez pas changer son état.", true);
      }
    }
  }

addImpact() {
  const dialogRef = this.dialog.open(CreateImpactPopUpComponent, {
    width: '400px'
  });

  dialogRef.afterClosed().subscribe((result: Impact) => {
    if (result && this.incident) {

      /* ─── Construction explicite du DTO ─── */
      const dto: ImpactCreateDto = {
        montant:    result.montant,
        entityId:   result.entityId,      // ou result.entiteResponsableId
        incidentId: this.incident.id,     // ← lier à l’incident courant
        type:       result.type,          // enum/chaine côté back
        message:    result.message ?? ''  // commentaire optionnel
      };


      this.impactService.addImpact(dto).subscribe(() => {
        this.confirmService.openConfirmDialog(
          'Impact ajouté',
          "L'impact a bien été ajouté à l'incident",
          false
        );
        this.ngOnInit();     // rafraîchir la vue
      });
    }
  });
}

  isNotClosed() {
    if (this.incident) {
      return this.incident.closedAt == null
    }
    return false
  }

  accessSuivi() {
    this.router.navigate(['incident', this.incident?.id, 'suivi'])
  }

  sendMessage() {
    if (this.incident && this.username) {
      this.suiviIncidentService.addSuiviIncident(this.message, this.incident.id, this.username).subscribe(
        () => {
          this.confirmService.openConfirmDialog("Message envoyé", "Le message a bien été envoyé", false);
          this.ngOnInit();
        });
    }
  }

  downloadExport(): void {
    if (!this.incident?.id) return;
    this.incidentService.downloadExport(this.incident.id);
  }

  // Méthodes pour la gestion des fichiers

  openFileUpload(): void {
    // Déclencher le clic sur l'input file caché
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  private handleFiles(files: File[]): void {
    files.forEach(file => {
      if (this.isValidFile(file)) {
        this.uploadFile(file);
      } else {
        this.confirmService.openConfirmDialog(
          "Fichier non supporté",
          `Le fichier ${file.name} n'est pas dans un format supporté.`,
          false
        );
      }
    });
  }

  private isValidFile(file: File): boolean {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    return validTypes.includes(file.type);
  }

  private uploadFile(file: File): void {
    if (!this.incident?.id) return;

    // TODO: Implémenter l'upload vers votre API
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('incidentId', this.incident.id);

    // this.fileService.uploadFile(formData).subscribe({
    //   next: (response) => {
    //     this.confirmService.openConfirmDialog("Fichier ajouté", `${file.name} a été ajouté avec succès.`, false);
    //     this.loadAttachedFiles(this.incident!.id);
    //   },
    //   error: (error) => {
    //     this.confirmService.openConfirmDialog("Erreur", `Erreur lors de l'upload de ${file.name}.`, false);
    //   }
    // });

    // Simulation d'upload pour la démo
    const newFile: AttachedFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date()
    };

    this.attachedFiles.push(newFile);
    this.confirmService.openConfirmDialog("Fichier ajouté", `${file.name} a été ajouté avec succès.`, false);
  }

  downloadFile(file: AttachedFile): void {
    // TODO: Implémenter le téléchargement depuis votre API
    // this.fileService.downloadFile(file.id).subscribe(blob => {
    //   const url = window.URL.createObjectURL(blob);
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.download = file.name;
    //   link.click();
    //   window.URL.revokeObjectURL(url);
    // });

    // Simulation pour la démo
    this.confirmService.openConfirmDialog("Téléchargement", `Téléchargement de ${file.name} en cours...`, false);
  }

  deleteFile(fileId: string): void {
    // TODO: Implémenter la suppression via votre API
    // this.fileService.deleteFile(fileId).subscribe({
    //   next: () => {
    //     this.attachedFiles = this.attachedFiles.filter(f => f.id !== fileId);
    //     this.confirmService.openConfirmDialog("Fichier supprimé", "Le fichier a été supprimé avec succès.", false);
    //   },
    //   error: (error) => {
    //     this.confirmService.openConfirmDialog("Erreur", "Erreur lors de la suppression du fichier.", false);
    //   }
    // });

    // Simulation pour la démo
    const file = this.attachedFiles.find(f => f.id === fileId);
    this.attachedFiles = this.attachedFiles.filter(f => f.id !== fileId);
    this.confirmService.openConfirmDialog("Fichier supprimé", `${file?.name} a été supprimé avec succès.`, false);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'pdf': 'picture_as_pdf',
      'doc': 'description',
      'docx': 'description',
      'png': 'image',
      'jpg': 'image',
      'jpeg': 'image',
      'txt': 'text_snippet',
      'csv': 'table_chart',
      'xlsx': 'table_chart',
      'xls': 'table_chart'
    };
    return iconMap[ext || ''] || 'insert_drive_file';
  }

  getFileIconClass(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    return `file-icon-${ext}`;
  }

  closeIncident(): void {
    if (!this.incident?.id) return;

    this.incidentService.close(this.incident.id).subscribe(() => {
      this.confirmService.openConfirmDialog("Clôturé", "L'incident a été clôturé.", false);
      this.ngOnInit();
    });
  }

  addActionPlan() {
    if(this.incident == null) {
      return;
    }
    
    let choice = confirm("Créer un plan d'action ou consulter un plan d'action existant ?")
    if(choice){
      this.dialog.open(CreateActionPlanDialogComponent, {
        width: '400px', 
        data : {
          incidentId : this.incident.id,
          reference : this.incident.reference
        }
      })
    }
    else{
      this.router.navigate(['action-plan', 'create', this.incident.id]);
    }
  }

}