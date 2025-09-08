// import { Component, Inject, OnInit, inject } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { FormsModule } from '@angular/forms';
// import { MatLabel, MatSuffix } from '@angular/material/form-field';
// import { EntitiesService } from '../../../../core/services/entities/entities.service';
// import { Process } from '../../../../core/models/Process';
// import { BusinessUnit } from '../../../../core/models/BusinessUnit';
// import { MatSelectModule } from '@angular/material/select';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatCardModule } from '@angular/material/card';
// import { MatTableModule } from '@angular/material/table';
// import { ActivatedRoute } from '@angular/router';
// import { GoBackButton } from '../../../../shared/components/go-back/go-back.component';
// import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
// import { FichiersComponent } from '../../../../shared/components/fichiers/fichiers.component';
// import { FileService } from '../../../../core/services/file/file.service';
// import { firstValueFrom } from 'rxjs';
// import { MatIconModule } from '@angular/material/icon';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { TargetType } from '../../../../core/enum/targettype.enum';
// import { OperatingLossService } from '../../../../core/services/operating-loss/operating-loss.service';
// import { OperatingLoss, OperatingLossTypeDto } from '../../../../core/models/OperatingLoss'; // classe domain pour l'affichage
// import { OperatingLossTypeService } from '../../../../core/services/operating-loss/operating-loss-type.service';
// import { OperatingLossState } from '../../../../core/enum/operatingLossState.enum';
// import { OperatingLossFamily } from '../../../../core/enum/operatingLossFamily.enum';


// @Component({
//   selector: 'app-create-impact-pop-up',
//   imports: [
//     FormsModule, MatDialogModule, MatLabel, MatCardModule,
//     MatSelectModule, MatInputModule, MatButtonModule, MatTableModule,
//     MatIconModule, MatTooltipModule, MatSuffix
//   ],
//   templateUrl: './create-impact-pop-up.component.html',
//   styleUrl: './create-impact-pop-up.component.scss'
// })
// export class CreateImpactPopUpComponent implements OnInit {

//   displayedColumns: string[] = [
//     'montantBrut',
//     'montantNet',
//     'montantFinal',
//     'entityName',
//     'type',
//     'createdAt',
//     'comptabilisationDate',
//     'fichiers',
//   ];

//   goBackButtons: GoBackButton[] = [];

//   private dialog = inject(MatDialog);
//   private impactService = inject(OperatingLossService);
//   private confirmService = inject(ConfirmService);
//   private fileService = inject(FileService);

//   // services injectés par ctor (pour garder le pattern que tu avais)
//   constructor(
//     private entiteService: EntitiesService,
//     private typeService: OperatingLossTypeService,
//     @Inject(MAT_DIALOG_DATA) public data: { incidentId: string, impact?: OperatingLoss },
//     private dialogRef: MatDialogRef<CreateImpactPopUpComponent>
//   ) {
//     this.incidentId = data.incidentId;
//   }

//   incidentId = '';
//   entites: BusinessUnit[] = [];
//   impacts: OperatingLoss[] = [];

//   // types venant du back (code/label/family)
//   types: OperatingLossTypeDto[] = [];
//   selectedType: string | null = null;

//   // état du formulaire de création (simple)
//   montant = 0;
//   comptabilisationDate: Date | null = null;
//   selectedEntite: BusinessUnit | undefined;

//   ngOnInit(): void {
//     // charger BU
//     this.entiteService.loadEntities(true).subscribe(list => {
//       this.entites = list;
//     });

//     // charger types depuis le back (pas d'enum front en dur)
//     this.typeService.getAll().subscribe(types => {
//       this.types = types;
//     });

//     // charger la liste existante des OperatingLoss pour l’incident
//     this.impactService.listByIncident(this.incidentId).subscribe(
//       impacts => this.impacts = impacts
//     );
//   }

//   closeDialog() {
//     this.dialogRef.close();
//   }

//   setEntite(entite: BusinessUnit) {
//     this.selectedEntite = entite;
//   }

//   addImpact() {
//     if (this.impact) {
//       const message = prompt("Pourquoi voulez-vous ajouter cet impact ?") || "";

//       if (message && message.trim().length > 0) {
//         const dto: CreateOperatingLossDto = {
//           montant: this.impact.montant,
//           comptabilisationDate: this.impact.comptabilisationDate ? this.impact.comptabilisationDate : null,
//           entityId: this.impact.entityId,
//           incidentId: this.incidentId,
//           type: this.impact.type,
//         };

//         this.impactService.create(dto, message).subscribe(() => {
//           this.confirmService.openConfirmDialog(
//             'Impact ajouté',
//             "L'impact a bien été ajouté à l'incident",
//             false
//           );
//           this.dialogRef.close();
//         });
//       }
//       else {
//         alert("⚠️ Le message est obligatoire pour justifier l’ajout de l’impact.");
//       }
//     }
//   }

//   addImpact() {
//     if (!this.selectedEntite) {
//       alert('Veuillez sélectionner une entité.');
//       return;
//     }
//     if (!this.selectedType) {
//       alert('Veuillez sélectionner un type.');
//       return;
//     }

//     const message = prompt("Pourquoi voulez-vous ajouter cet impact ?") || "";
//     if (!message.trim()) {
//       alert("⚠️ Le message est obligatoire pour justifier l’ajout de l’impact.");
//       return;
//     }

//     // retrouver le type sélectionné (pour connaître la famille)
//     const selectedType = this.types.find(t => t.libelle === this.selectedType);
//     if (!selectedType) {
//       alert('Type invalide.');
//       return;
//     }

//     // AmountType selon la famille
//     const isNonFinancier = selectedType.family === OperatingLossFamily.NON_FINANCIER;
//     const amountType = isNonFinancier ? 'MONTANT_ESTIME_NON_FINANCIER' : 'MONTANT_ESTIME';


//     this.impactService.create(req).subscribe(() => {
//       this.confirmService.openConfirmDialog(
//         'Impact ajouté',
//         "L'impact a bien été ajouté à l'incident",
//         false
//       );
//       this.dialogRef.close(true);
//     });
//   }

//   async viewFiles(impact: OperatingLoss) {
//     // garde TargetType.IMPACT si ton back attend toujours ce code
//     const files = await firstValueFrom(this.fileService.getFiles(TargetType.IMPACT, impact.id));
//     this.dialog.open(FichiersComponent, { width: '400px', data: { files } });
//   }
// }
