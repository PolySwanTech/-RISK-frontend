import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Process } from '../../models/Process';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/processes';;

  getAllGroupedByBu() {
    return this.http.get<{ [key: string]: Process[] }>(this.baseUrl);
  }

  getAll(): Observable<Process[]> {
    return this.http.get<Process[]>(this.baseUrl);
  }

  /** Récupère un process par son UUID */
  get(id: string): Observable<Process> {
    return this.http.get<Process>(`${this.baseUrl}/${id}`);
  }

  createProcess(process: { name: string; bu: string, parentId?: string }) {
    return this.http.post<Process>(this.baseUrl, process)
  }

  updateProcess(id: string, process: { name: string; parentId?: string }) {
    return this.http.put<Process>(`${this.baseUrl}/${id}`, process);
  }

  getProcessTree(buId?: string): Observable<Process[]> {
    const options = buId ? { params: new HttpParams().set('buId', buId) } : {};
    return this.http.get<Process[]>(`${this.baseUrl}/tree`, options);
  }

  getProcessLeaf(buId: string): Observable<Process[]> {
    const options = { params: new HttpParams().set('buId', buId) };
    return this.http.get<Process[]>(`${this.baseUrl}/leaf`, options);
  }

  getAllByRisks(riskId: string) {
    let params = new HttpParams();
    params = params.append('riskId', riskId);
    return this.http.get<Process[]>(this.baseUrl + '/by-dmr', { params: params });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
