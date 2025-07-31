import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ImpactService } from '../../../../core/services/impact/impact.service';
import { Impact, ImpactCreateDto } from '../../../../core/models/Impact';
import { DatePipe, CommonModule, CurrencyPipe } from '@angular/common';
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

@Component({
  selector: 'app-list-impact',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule,
    MatGridListModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatTooltipModule, CommonModule, CurrencyPipe],
  templateUrl: './list-impact.component.html',
  styleUrl: './list-impact.component.scss'
})
export class ListImpactComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
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

    this.router.navigate(['incident', this.incidentId, 'impacts']);

    // const dialogRef = this.dialog.open(CreateImpactPopUpComponent, {
    //   width: '700px',
    //   height : '700px',
    //   data : {
    //     impacts : this.impacts 
    //   }
    // });

    // dialogRef.afterClosed().subscribe((result: { impact: Impact, message: string }) => {
    //   if (result) {
    //     /* ─── Construction explicite du DTO ─── */
    //     
    //   }
    // });
  }
}
