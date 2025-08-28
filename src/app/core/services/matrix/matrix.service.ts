import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Matrix } from '../../models/Matrix';
import { RangeType } from '../../../features/cartographie/matrix-settings/matrix-settings.component';
import { Range } from '../../../features/cartographie/matrix-settings/matrix-settings.component';

@Injectable({
  providedIn: 'root'
})
export class MatrixService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/matrix';

  /** Récupère toutes les matrices */
  getMatrices(): Observable<Matrix[]> {
    return this.http.get<Matrix[]>(this.baseUrl);
  }

  /** Récupère une matrice par son id */
  getMatriceById(id: string): Observable<Matrix> {
    return this.http.get<Matrix>(`${this.baseUrl}/${id}`);
  }

  getDefaultMatrix(buId: string): Observable<Matrix> {
    const params = new HttpParams().set("buId", buId);
    return this.http.get<Matrix>(this.baseUrl, { params: params });
  }

  saveMatrix(matrix: any): Observable<Matrix> {
    return this.http.post<Matrix>(`${this.baseUrl}`, matrix);
  }

  updateCells(cells: any[]): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/cells`, cells);
  }

  saveScale(list: Range[], rangeType: RangeType): Observable<any> {
    list.forEach((item: any) => {
      item.type = rangeType;
    });
    return this.http.post<any>(`${this.baseUrl}/scale`, { scales: list, type: rangeType });
  }

}