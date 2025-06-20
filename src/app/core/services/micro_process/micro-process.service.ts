// import { HttpClient } from '@angular/common/http';
// import { Injectable, inject } from '@angular/core';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';
// import { MicroProcess } from '../../models/MicroProcess';

// @Injectable({
//   providedIn: 'root'
// })
// export class MicroProcessService {
//   private http = inject(HttpClient);
//   private baseUrl = `${environment.apiUrl}/micro-processes`;

//   getAll(): Observable<MicroProcess[]> {
//     return this.http.get<MicroProcess[]>(this.baseUrl);
//   }
// }