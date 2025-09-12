import { Component, Inject, inject, Input, Optional } from '@angular/core';
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
import { TargetType } from '../../../core/enum/targettype.enum';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';

export interface UploadedFile {
  id: string;
  filename: string;
  objectKey: string;
  contentType: string;
  size: number;
  etag: string;
  uploadedAt: Date;
  uploadedBy: string;
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
  private snackbarService = inject(SnackBarService);
  private fileService = inject(FileService);

  searchQuery: string = '';
  filteredFilesCount: number = 0;

  @Input() targetType: TargetType = TargetType.INCIDENT; // défaut
  @Input() targetId: string = '';                        // id incident OU impact

  @Input() incidentId: string = ''
  @Input() incidentRef: string = ''
  @Input() closed: boolean | null = null;
  @Input() attachedFiles: UploadedFile[] = []

  filteredFiles: UploadedFile[] = [];

  isDragOver = false;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data?: {
    files?: UploadedFile[];
    targetType?: TargetType;
    targetId?: string;
    closed?: boolean;
  }) { }

  ngOnInit(): void {
    // Data du dialog > Inputs si fournis
    if (this.data?.targetType) this.targetType = this.data.targetType;
    if (this.data?.targetId) this.targetId = this.data.targetId;
    if (this.data?.closed) this.closed = this.data.closed;

    // Si des fichiers sont déjà fournis (dialog)
    if (this.data?.files?.length) {
      this.attachedFiles = this.data.files;
      this.filteredFiles = this.data.files;
      this.filteredFilesCount = this.filteredFiles.length;
    }

    // Sinon on charge depuis l’API si on a le contexte
    if (!this.attachedFiles.length && this.targetId) {
      this.fileService.getFiles(this.targetType, this.targetId).subscribe(files => {
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

  private async handleFiles(files: File[]) {
    const validFiles: File[] = [];

    // On prépare toutes les promesses d'upload
    const uploadPromises: Promise<void>[] = [];

    for (const file of files) {
      if (this.isValidFile(file)) {
        validFiles.push(file);
        uploadPromises.push(this.uploadFile(file)); // on stocke la promesse
      } else {
        this.confirmService.openConfirmDialog(
          "Fichier non supporté",
          `Le fichier ${file.name} n'est pas dans un format supporté.`,
          false
        );
      }
    }

    if (validFiles.length > 0) {
      try {
        // attendre que TOUS les fichiers soient uploadés
        await Promise.all(uploadPromises);

        const fileNames = validFiles.map(f => f.name).join(", ");
        const message =
          validFiles.length === 1
            ? `Le fichier ${fileNames} a été ajouté avec succès.`
            : `Les fichiers ${fileNames} ont été ajoutés avec succès.`;

        this.snackbarService.success("Fichier(s) ajouté(s) " + message);
        this.ngOnInit();
      } catch (error) {
        this.confirmService.openConfirmDialog(
          "Erreur",
          "Une erreur est survenue lors de l'upload d'un ou plusieurs fichiers.",
          false
        );
      }
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

  private async uploadFile(file: File): Promise<void> {
    if (!this.targetId) {
      this.confirmService.openConfirmDialog("Erreur", "Aucune cible définie pour l’upload.", false);
      return;
    }

    this.fileService.uploadFile(file, this.targetType, this.targetId).subscribe({
      next: _ => {
        // Refresh la liste
        this.fileService.getFiles(this.targetType, this.targetId).subscribe(files => {
          this.attachedFiles = files;
          this.filteredFiles = files;
          this.filteredFilesCount = files.length;
        });
      },
      error: _ => {
        this.confirmService.openConfirmDialog(
          "Erreur",
          `Erreur lors de l'ajout du fichier ${file.name}.`,
          false
        );
      }
    });
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

  //   // TODO: Implémenter la "suppression", mais il faut juste cacher le file ne plus le rendre apparant-> pour la traçabilité
  // deleteFile(fileId: string): void {
  //   this.fileService.deleteFile(fileId).subscribe({
  //     next: () => {
  //       this.attachedFiles = this.attachedFiles.filter(f => f.id !== fileId);
  //       this.confirmService.openConfirmDialog("Fichier supprimé", "Le fichier a été supprimé avec succès.", false);
  //     },
  //     error: (error) => {
  //       this.confirmService.openConfirmDialog("Erreur", "Erreur lors de la suppression du fichier.", false);
  //     }
  //   });

  //   // Simulation pour la démo
  //   const file = this.attachedFiles.find(f => f.id === fileId);
  //   this.attachedFiles = this.attachedFiles.filter(f => f.id !== fileId);
  //   this.filteredFiles = this.attachedFiles;
  //   this.confirmService.openConfirmDialog("Fichier supprimé", `${file?.filename} a été supprimé avec succès.`, false);
  // }

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