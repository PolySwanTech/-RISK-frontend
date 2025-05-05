import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Process } from '../../models/Process';
import { EntiteResponsable } from '../../models/EntiteResponsable';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  http = inject(HttpClient);

  baseUrl = environment.apiProcess

  getAll(){
    return this.http.get<Process[]>(this.baseUrl)
  }

  createProcess(process : Process){ 
    return this.http.post<Process>(this.baseUrl, process);
  }

  getAllByEntite(id : string){
    let param = new HttpParams();
    param = param.set('buId', id);
    return this.http.get<Process[]>(this.baseUrl, {params : param})
  }
}
