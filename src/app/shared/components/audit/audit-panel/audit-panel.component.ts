import { Component, inject, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuditService } from '../../../../core/services/audit/audit.service';
import { DatePipe } from '@angular/common';
import { TargetType } from '../../../../core/enum/targettype.enum';
import { SnackBarService } from '../../../../core/services/snack-bar/snack-bar.service';

@Component({
  selector: 'app-audit-panel',
  imports: [DatePipe],
  templateUrl: './audit-panel.component.html',
  styleUrls: ['./audit-panel.component.scss']
})
export class AuditPanelComponent implements OnInit {

  @Input() contextId!: string;
  @Input() contextType!: string;

  auditList: any[] = []

  private auditService = inject(AuditService);
  private snackBarService = inject(SnackBarService);


  ngOnInit(): void {
    this.auditService.getAudit().subscribe(
      list => this.auditList = list
    )
  }

  addAudit() {
    this.auditService.openAuditDialog(this.contextId, this.contextType as TargetType)
      .afterClosed()
      .subscribe(res => {
        if (res) {
          this.snackBarService.info("Audit ajouté avec succès");
          this.ngOnInit();
        }
      })
  }


}
