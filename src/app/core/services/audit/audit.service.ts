import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TargetType } from '../../enum/targettype.enum';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { AuditComponent } from '../../../shared/components/audit/audit.component';

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  openAuditDialog(targetId: string, targetType: TargetType) {
    return this.dialog.open(AuditComponent, {
      width: '120vw',
      data: {
        targetId: targetId,
        targetType: targetType
      }
    })
  }

  private http = inject(HttpClient);
  private dialog = inject(MatDialog);

  private baseUrl = environment.apiUrl + '/audit'

  trace(targetId: string, targetType: TargetType, comments: string) {
    const params = new HttpParams().set("targetId", targetId).set("type", targetType);
    return this.http.post(this.baseUrl, comments, { params: params });
  }

  getAudit(id : string, type : TargetType){
    const params = new HttpParams().set("targetId", id).set("targetType", type);
    return this.http.get<any[]>(this.baseUrl, {params : params});
  }

}
