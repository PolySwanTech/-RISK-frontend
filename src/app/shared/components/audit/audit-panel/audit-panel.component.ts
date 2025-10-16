import { MatIconModule } from '@angular/material/icon';
import { Component, inject, Input, OnInit } from '@angular/core';
import { AuditService } from '../../../../core/services/audit/audit.service';
import { CommonModule, DatePipe } from '@angular/common';
import { TargetType } from '../../../../core/enum/targettype.enum';
import { SnackBarService } from '../../../../core/services/snack-bar/snack-bar.service';
import { HasPermissionDirective } from "../../../../core/directives/has-permission.directive";
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-audit-panel',
  imports: [DatePipe, HasPermissionDirective, MatCardModule, CommonModule, MatIconModule],
  templateUrl: './audit-panel.component.html',
  styleUrls: ['./audit-panel.component.scss']
})
export class AuditPanelComponent implements OnInit {

  @Input() contextId!: string;
  @Input() contextType!: TargetType;

  auditList: any[] = []

  private auditService = inject(AuditService);
  private snackBarService = inject(SnackBarService);

  ngOnInit(): void {
    this.auditService.getAudit(this.contextId, this.contextType).subscribe(
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
