import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UtilisateurService } from '../../../../core/services/utilisateur/utilisateur.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { UtilisateurProfil } from '../../../../core/models/UtilisateurProfil';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIconModule
  ]
})
export class UserListComponent implements OnInit, AfterViewInit {
  private userService = inject(UtilisateurService);

  dataSource = new MatTableDataSource<UtilisateurProfil>();
  displayedColumns = ['username', 'email', 'equipeName', 'role', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.userService.getUserProfiles().subscribe(users => {
      this.dataSource.data = users;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
