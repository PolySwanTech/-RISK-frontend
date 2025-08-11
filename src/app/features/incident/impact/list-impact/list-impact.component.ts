import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImpactService } from '../../../../core/services/impact/impact.service';
import { Impact, ImpactCreateDto } from '../../../../core/models/Impact';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CreateImpactPopUpComponent } from '../create-impact-pop-up/create-impact-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
import { ImpactCardComponent } from '../impact-card/impact-card.component';

@Component({
  selector: 'app-list-impact',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule,
    MatGridListModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatTooltipModule, CommonModule, ImpactCardComponent],
  templateUrl: './list-impact.component.html',
  styleUrl: './list-impact.component.scss'
})
export class ListImpactComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private impactService = inject(ImpactService);
  private dialog = inject(MatDialog);
  private confirmService = inject(ConfirmService);

  incidentId: string = this.route.snapshot.paramMap.get('id') || '';

  impacts: Impact[] = [];
  totalAmount = 0;

  @Input() closed: boolean = false;

  ngOnInit() {
    if (this.incidentId) {
      this.impactService.getImpactByIncidentId(this.incidentId).subscribe(impacts => {
        this.impacts = impacts;
      });

      this.impactService.sum(this.incidentId).subscribe(
        result => this.totalAmount = result
      )
    }
  }

  addImpact() {
    const dialogRef = this.dialog.open(CreateImpactPopUpComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result: { impact: Impact, message: string }) => {
      if (result) {
        /* ─── Construction explicite du DTO ─── */
        const dto: ImpactCreateDto = {
          montant: result.impact.montant,
          comptabilisationDate: result.impact.comptabilisationDate ? result.impact.comptabilisationDate : null,
          entityId: result.impact.entityId,
          incidentId: this.incidentId,
          type: result.impact.type,
        };

        this.impactService.addImpact(dto, result.message).subscribe(() => {
          this.confirmService.openConfirmDialog(
            'Impact ajouté',
            "L'impact a bien été ajouté à l'incident",
            false
          );
          this.ngOnInit();     // rafraîchir la vue
        });
      }
    });
  }
}
