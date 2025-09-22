// file.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TargetType } from '../../enum/targettype.enum';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// modèle tel que renvoyé par le back (nullable possible)
export interface FileEntity {
  id: string;
  filename: string | null;
  objectKey: string;
  contentType: string | null;
  size: number | null;
  etag: string | null;
  uploadedAt: string | null; // Instant côté back → string ISO
  uploadedBy: string | null;
  descriptif?: string | null;
}

// ce que ton UI consomme
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

@Injectable({ providedIn: 'root' })
export class FileService {
  private baseUrl = environment.apiUrl + '/files';
  private http = inject(HttpClient);

  /** POST /files/upload/{type}/{id} */
  uploadFile(file: File, type: TargetType, targetId: string) {
    const formData = new FormData();
    formData.append('file', file);
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
