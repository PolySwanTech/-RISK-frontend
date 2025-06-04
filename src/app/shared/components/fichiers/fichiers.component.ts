import { Component, inject, Input } from '@angular/core';
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

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url?: string;
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
  searchQuery: string = '';
  filteredFilesCount: number = 0;

  @Input() idIncident: string | null = null;
  @Input() closed: boolean | null = null;
  @Input() attachedFiles: AttachedFile[] = []

  filteredFiles: AttachedFile[] = [];

  isDragOver = false;

  ngOnInit(): void {
    this.attachedFiles = [
      {
        id: '1',
        name: 'rapport-incident.pdf',
        size: 2458624, // 2.4 MB
        type: 'application/pdf',
        uploadedAt: new Date('2025-05-22')
      },
      {
        id: '2',
        name: 'capture-ecran-serveur.png',
        size: 876544, // 856 KB
        type: 'image/png',
        uploadedAt: new Date('2025-05-22')
      },
      {
        id: '3',
        name: 'capture-ecran-serveur.docx',
        size: 876544, // 856 KB
        type: 'image/png',
        uploadedAt: new Date('2025-05-22')
      },
      {
        id: '4',
        name: 'capture-ecran-serveur.csv',
        size: 876544, // 856 KB
        type: 'image/png',
        uploadedAt: new Date('2025-05-22')
      },
      {
        id: '5',
        name: 'capture-ecran-serveur.txt',
        size: 876544, // 856 KB
        type: 'image/png',
        uploadedAt: new Date('2025-05-22')
      }
    ];
    this.filteredFiles = this.attachedFiles;
  }

  formatDate(dateString: any) {
    return dateString ? dateString.toLocaleDateString("fr-FR") : null;
  }

  isNotClosed() {
    if (this.closed) {
      return false;
    }
    return true
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
    if (!this.idIncident) return;

    // TODO: Implémenter l'upload vers votre API
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('incidentId', this.idIncident);

    // this.fileService.uploadFile(formData).subscribe({
    //   next: (response) => {
    //     this.confirmService.openConfirmDialog("Fichier ajouté", `${file.name} a été ajouté avec succès.`, false);
    //     this.loadAttachedFiles(this.idIncident);
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
    this.filteredFiles = this.attachedFiles;
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
    this.filteredFiles = this.attachedFiles;
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
    return `${ext}`;
  }

  // Méthodes à ajouter dans votre composant
  onSearchFiles(event: any): void {
    this.searchQuery = event.target.value.toLowerCase().trim();

    if (!this.searchQuery) {
      this.filteredFiles = this.attachedFiles;
    } else {
      this.filteredFiles = this.attachedFiles.filter(file => {
        const nameMatches = file.name.toLowerCase().includes(this.searchQuery);

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

}