import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-button-add-file',
  imports: [CommonModule, MatIconModule],
  templateUrl: './button-add-file.component.html',
  styleUrls: ['./button-add-file.component.scss'],
})
export class ButtonAddFileComponent {
  @Input() label: string = 'Télécharger des fichiers'; // Texte du bouton
  @Input() accept: string = ''; // Types de fichiers acceptés
  @Input() preview: boolean = false; // Afficher les prévisualisations ?
  @Input() list: any[] = [];
  @Output() filesSelected = new EventEmitter<File[]>(); // Émet une liste de fichiers

  filePreviews: string[] = []; // Liste des prévisualisations
  selectedFiles: File[] = []; // Liste des fichiers sélectionnés
  imageToShow: string | null = null;

  constructor(private dialog: MatDialog) {}

  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    this.selectedFiles = Array.from(files); // Convertir FileList en tableau
    this.filesSelected.emit(this.selectedFiles); // Émet la liste des fichiers

    if (this.preview) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            this.filePreviews.push(reader.result as string); // Ajoute chaque prévisualisation
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  resetFiles() {
    this.filePreviews = [];
    this.list = [];
    this.filesSelected.emit(this.list);
  }

  onDeleteImagePreview(list: any[], imageUrl: string): void {
    if (this.filePreviews && this.filePreviews.includes(imageUrl)) {
      const fileName = this.getFileNameFromUrl(imageUrl); // Extraire le nom du fichier à partir de l'URL
      const index = this.filePreviews.findIndex(preview => this.getFileNameFromUrl(preview) === fileName); // Comparer les noms des fichiers
    
      if (index > -1) {
        this.filePreviews.splice(index, 1); // Supprime de filePreviews
  
        // Supprime également l'image correspondante de newImages
        if (list) {
          console.log(list);
          list.splice(index, 1); // Suppression de l'image basée sur le nom
          console.log(list);
        }
      }
    }
  }
  
  // Fonction utilitaire pour extraire le nom du fichier à partir de l'URL
  getFileNameFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1]; // Récupère la dernière partie de l'URL (nom du fichier)
  }
}