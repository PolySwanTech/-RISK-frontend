import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TargetType } from '../../enum/targettype.enum';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { AuditComponent } from '../../../shared/components/audit/audit.component';
import { SnackBarService } from '../snack-bar/snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private snackBarService = inject(SnackBarService);

  private baseUrl = environment.apiUrl + '/audit'

  trace(targetId: string, targetType: TargetType, comments: string) {
    const params = new HttpParams().set("targetId", targetId).set("type", targetType);
    return this.http.post(this.baseUrl, comments, { params: params });
  }

  openAuditDialog(targetId: string, targetType: TargetType) {
    return this.dialog.open(AuditComponent, {
      width: '120vw',
      data: {
        targetId: targetId,
        targetType: targetType
      }
    })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.snackBarService.info("Action abandonnée avec succès.")
        }
        else {
          this.snackBarService.info("Action non-abandonnée.")
        }
      })
  }

}
