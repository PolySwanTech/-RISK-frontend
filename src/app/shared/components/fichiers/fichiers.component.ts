import { Component, Inject, inject, Input, Optional } from '@angular/core';
import { Incident } from '../../../core/models/Incident';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileService } from '../../../core/services/file/file.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { TargetType } from '../../../core/enum/targettype.enum';

export interface UploadedFile {
  id: string;
  filename: string;
  objectKey: string;
  contentType: string;
  size: number;
  etag: string;
  uploadedAt: Date;
}

@Component({
  selector: 'app-fichiers',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule,
    MatGridListModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatTooltipModule, CommonModule],
  templateUrl: './fichiers.component.html',
  styleUrl: './fichiers.component.scss'
})
export class FichiersComponent {

  private confirmService = inject(ConfirmService);
  private fileService = inject(FileService);

  searchQuery: string = '';
  filteredFilesCount: number = 0;

  @Input() incidentId: string = ''
  @Input() incidentRef: string = ''
  @Input() closed: boolean | null = null;
  @Input() attachedFiles: UploadedFile[] = []

  filteredFiles: UploadedFile[] = [];

  isDragOver = false;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data?: { files: UploadedFile[] }) { }

  ngOnInit(): void {

    if (this.data?.files) {
    this.attachedFiles = this.data.files;
    this.filteredFiles = this.data.files;
  }

    if (this.incidentId && this.incidentRef) {
      this.fileService.getFiles({ incidentId: this.incidentId }).subscribe(files => {
        this.attachedFiles = files;
        this.filteredFiles = files;
        this.filteredFilesCount = files.length;
      });
    }
  }

  formatDate(dateString: any) {
    return dateString ? dateString.toLocaleDateString("fr-FR") : null;
  }

  normalize(str?: string): string {
    return str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() || '';
  }

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
    const validFiles: File[] = [];

    files.forEach(file => {
      if (this.isValidFile(file)) {
        this.uploadFile(file);
        validFiles.push(file);
      } else {
        this.confirmService.openConfirmDialog(
          "Fichier non supporté",
          `Le fichier ${file.name} n'est pas dans un format supporté.`,
          false
        );
      }
    });

    if (validFiles.length > 0) {
      const fileNames = validFiles.map(f => f.name).join(", ");
      const message = validFiles.length === 1
        ? `Le fichier ${fileNames} a été ajouté avec succès.`
        : `Les fichiers ${fileNames} ont été ajoutés avec succès.`;

      this.confirmService.openConfirmDialog("Fichier(s) ajouté(s)", message, false);
    }
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

    if (this.data && this.data.files) {
      this.fileService.uploadFile(file, "IMP_2025_001", "289b1b94-5fa1-49fc-bb7d-cf5024e4fdcf", TargetType.IMPACT).subscribe(
        {
          next: _ => {
            this.confirmService.openConfirmDialog("Fichier ajouté", `${file.name} a été ajouté avec succès.`, false);
            this.ngOnInit();
          },
          error: error => {
            this.confirmService.openConfirmDialog("Erreur", `Erreur lors de l'ajout du fichier ${file.name}.`, false);
          }
        }
      )
    }

    if (!this.incidentId) return;

    this.fileService.uploadFile(file, this.incidentRef, this.incidentId, TargetType.INCIDENT).subscribe(
      {
        next: _ => {
          this.confirmService.openConfirmDialog("Fichier ajouté", `${file.name} a été ajouté avec succès.`, false);
          this.ngOnInit();
        },
        error: error => {
          this.confirmService.openConfirmDialog("Erreur", `Erreur lors de l'ajout du fichier ${file.name}.`, false);
        }
      }
    )
  }

  downloadFile(file: UploadedFile, openInBrowser: boolean = false): void {
    const action = openInBrowser ? 'Ouverture' : 'Téléchargement';
    this.confirmService
      .openConfirmDialog(action, `${action} de ${file.filename} en cours...`, false)
      .subscribe();

    this.fileService.downloadFile(file.objectKey).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        if (openInBrowser) {
          // Ouvrir dans un nouvel onglet
          window.open(url, '_blank');
          console.log("ici")
        } else {
          // Télécharger
          const a = document.createElement('a');
          a.href = url;
          a.download = file.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      },
      error: (err) => {
        console.error("Erreur lors du téléchargement :", err);
      }
    });
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
    this.filteredFiles = this.attachedFiles;
    this.confirmService.openConfirmDialog("Fichier supprimé", `${file?.filename} a été supprimé avec succès.`, false);
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
    return `${ext}`;
  }

  // Méthodes à ajouter dans votre composant
  onSearchFiles(event: any): void {
    this.searchQuery = event.target.value.toLowerCase().trim();

    if (!this.searchQuery) {
      this.filteredFiles = this.attachedFiles;
    } else {
      this.filteredFiles = this.attachedFiles.filter(file => {
        const nameMatches = file.filename.toLowerCase().includes(this.searchQuery);

        // Format de la date : 22/05/2025
        const date = file.uploadedAt instanceof Date ? file.uploadedAt : new Date(file.uploadedAt);
        const formattedDate = date.toLocaleDateString('fr-FR'); // ex : "22/05/2025"

        const dateMatches = formattedDate.includes(this.searchQuery);

        return nameMatches || dateMatches;
      });
    }

    this.filteredFilesCount = this.filteredFiles.length;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredFiles = this.attachedFiles;
    this.filteredFilesCount = 0;
  }

  preview(file: UploadedFile) {
    this.downloadFile(file, true);
  }

}