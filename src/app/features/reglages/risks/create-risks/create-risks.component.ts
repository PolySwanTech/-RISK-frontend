import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RiskService } from '../../../../core/services/risk/risk.service';
import { Risk } from '../../../../core/models/Risk';
import { FormsModule } from '@angular/forms';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';

@Component({
  selector: 'app-create-risks',
  imports: [FormsModule],
  templateUrl: './create-risks.component.html',
  styleUrl: './create-risks.component.scss'
})
export class CreateRisksComponent {

  private route = inject(ActivatedRoute)
  private riskService = inject(RiskService);
  private confirmService = inject(ConfirmService);

  risk : Risk | undefined

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || "";
    if(id === 'create'){
      this.risk = new Risk('', '', '', []);
      // creation mode
    }
    else{
      this.loadRiskById(id);
    }
  }

  loadRiskById(id: string) {
    this.riskService.getById(id).subscribe(rep => this.risk = rep);
  }

  createRisk(){
    if(this.risk){
      this.riskService.save(this.risk).subscribe(
        risk => {
          this.confirmService.openConfirmDialog("Mise à jour", "La mise à jour du risque a été réalisé avec succès", false)
        }
      )
    }
  }

}

