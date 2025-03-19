import { Component } from '@angular/core';
import { Impact } from '../../../core/models/Impact';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-create-impact-pop-up',
  imports: [FormsModule, MatDialogModule, MatFormField,MatLabel],
  templateUrl: './create-impact-pop-up.component.html',
  styleUrl: './create-impact-pop-up.component.scss'
})
export class CreateImpactPopUpComponent {

  impact : Impact = new Impact('', 0, '', new Date())

  constructor(
    public dialogRef: MatDialogRef<CreateImpactPopUpComponent>, // MatDialogRef for dialog control
  ){
    
  }

  close(){
    this.dialogRef.close();
  }


  addImpact() {
    this.dialogRef.close(this.impact)
  }
}
