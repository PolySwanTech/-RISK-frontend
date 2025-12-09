import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Process } from '../../models/Process';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/processes';;

  getAll(): Observable<Process[]> {
    return this.http.get<Process[]>(this.baseUrl);
  }

  createProcess(process: { name: string; bu: string, parentId?: string }) {
    return this.http.post<Process>(this.baseUrl, process)
  }

  updateProcess(id: string, process: { name: string; parentId?: string }) {
    return this.http.put<Process>(`${this.baseUrl}/${id}`, process);
  }

  getProcessTree(buId?: string): Observable<Process[]> {
    let params = new HttpParams();
    
    if (buId) params = params.set('buId', buId);
    return this.http.get<Process[]>(`${this.baseUrl}/tree`, {params});
  }

  getProcessLeaf(buId: string): Observable<Process[]> {
    const options = { params: new HttpParams().set('buId', buId) };
    return this.http.get<Process[]>(`${this.baseUrl}/leaf`, options);
  }
}
