import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../core/services/utilisateur/utilisateur.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  imports: [MatCardModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  listTest : any = [];
  
  constructor(private utilisateurService : UtilisateurService){
  }

  ngOnInit() {
    this.utilisateurService.getPosts().subscribe((data) => {
      this.listTest = data.slice(0, 5);
    });
  }
}
