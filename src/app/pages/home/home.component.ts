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

  constructor(private utilisateurService : UtilisateurService){

  }

  ngOnInit() {
    this.utilisateurService.getPosts().subscribe((data) => {
      console.log(data)
    });
  }
}
