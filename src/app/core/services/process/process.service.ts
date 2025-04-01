import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Process } from '../../models/Process';
import { EntiteImpactee } from '../../models/EntiteImpactee';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl

  getAll(){
    return this.http.get<Process[]>(this.baseUrl + '/processes')
  }

  getAllByEntite(entite : EntiteImpactee){
    let param = new HttpParams();
    param = param.set('idEntite', entite.id);
    return this.http.get<Process[]>(this.baseUrl + '/processes/entite', {params : param})
  }
}
