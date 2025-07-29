import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UploadedFile } from '../../../shared/components/fichiers/fichiers.component';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private baseUrl = environment.apiUrl + '/files'; 
  private http = inject(HttpClient);

  uploadFile(file: File, incidentRef: string, incidentId : string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('incidentRef', incidentRef);
    formData.append('incidentId', incidentId);
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  getFiles(incidentId: string) {
    const params = new HttpParams().set('incidentId', incidentId);
    return this.http.get<UploadedFile[]>(`${this.baseUrl}`, { params : params });
  }

  downloadFile(objectKey: string) {
    const params = new HttpParams().set('objectKey', objectKey);
    return this.http.get(this.baseUrl + '/download', {params : params, responseType: 'blob'});
  }
}
