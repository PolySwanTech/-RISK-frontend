import { Component, inject } from '@angular/core';
import { PopupHeaderComponent } from '../popup-header/popup-header.component';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuditService } from '../../../core/services/audit/audit.service';

@Component({
  selector: 'app-audit',
  imports: [PopupHeaderComponent, MatCardModule, FormsModule, CommonModule],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AuditComponent {
 
  comments : string = ''

  private dialogRef = inject(MatDialogRef<AuditComponent>)
  public data = inject(MAT_DIALOG_DATA);
  private auditService = inject(AuditService);

  closePopUp(){
    this.dialogRef.close(false);
  }

  confirm(){
    this.auditService.trace(this.data.targetId, this.data.targetType, this.comments).subscribe(
      _ => {
        this.dialogRef.close(this.comments);
      }
    )
  }

}
