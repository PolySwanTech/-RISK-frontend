import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UploadedFile } from '../../../shared/components/fichiers/fichiers.component';
import { TargetType } from '../../enum/targettype.enum';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private baseUrl = environment.apiUrl + '/files';
  private http = inject(HttpClient);

  uploadFile(file: File, id : string, ref : string, typeObject : TargetType) {
    const formData = new FormData();
    formData.append('file', file);
    const keyReference = typeObject == TargetType.IMPACT ? "impactId" : "incidentId";
    const keyId = typeObject == TargetType.IMPACT ? "impactRef" : "incidentRef";
    formData.append(keyReference, ref);
    formData.append(keyId, id);
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  getFiles(params: { [key: string]: string }) {
    return this.http.get<UploadedFile[]>(`${this.baseUrl}`, { params });
  }

  downloadFile(objectKey: string) {
    const params = new HttpParams().set('objectKey', objectKey);
    return this.http.get(this.baseUrl + '/download', { params: params, responseType: 'blob' });
  }
}
