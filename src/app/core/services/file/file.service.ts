// file.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TargetType } from '../../enum/targettype.enum';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FichiersComponent } from '../../../shared/components/fichiers/fichiers.component';
import { UploadedFile } from '../../models/uploaded-file';

// modèle tel que renvoyé par le back (nullable possible)
interface FileEntity {
  id: string;
  filename: string | null;
  objectKey: string;
  contentType: string | null;
  size: number | null;
  etag: string | null;
  uploadedAt: string | null; // Instant côté back → string ISO
  uploadedBy: string | null;
  description?: string | null;
}


@Injectable({ providedIn: 'root' })
export class FileService {

  openFiles(files : UploadedFile[], target : TargetType, targetId : string, closed : boolean = false) {
    return this.dialog.open(FichiersComponent,
      {
        width: '600px',
        data: {
          files: files,
          targetType: target,
          targetId: targetId,
          closed: closed
        }
      }
    )
  }

  private baseUrl = environment.apiUrl + '/files';
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);

  /** POST /files/upload/{type}/{id} */
  uploadFile(file: File, type: TargetType, targetId: string, description: string = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    
    return this.http.post<void>(`${this.baseUrl}/upload/${type}/${targetId}`, formData);
  }

  /** GET /files/{type}/{id} → map en UploadedFile[] (non-nullables) */
  getFiles(type: TargetType, id: string): Observable<UploadedFile[]> {
    return this.http.get<FileEntity[]>(`${this.baseUrl}/${type}/${id}`).pipe(
      map(list =>
        (list ?? []).map(f => ({
          id: f.id,
          filename: f.filename ?? 'fichier',
          objectKey: f.objectKey,
          contentType: f.contentType ?? 'application/octet-stream',
          size: f.size ?? 0,
          etag: f.etag ?? '',
          uploadedAt: f.uploadedAt ? new Date(f.uploadedAt) : new Date(0),
          uploadedBy: f.uploadedBy ?? 'inconnu',
          description: f.description ?? '',
        }))
      )
    );
  }

  /** GET /files/download?objectKey=... */
  downloadFile(objectKey: string) {
    return this.http.get(`${this.baseUrl}/download`, {
      params: { objectKey },
      responseType: 'blob',
    });
  }
}
