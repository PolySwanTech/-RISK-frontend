import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UtilisateurService } from '../../../../core/services/utilisateur/utilisateur.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { UtilisateurProfil } from '../../../../core/models/UtilisateurProfil';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserComponent } from '../../create/create-user/create-user.component';
import { MatButtonModule } from '@angular/material/button';
import { Utilisateur } from '../../../../core/models/Utilisateur';
import { GoBackButton, GoBackComponent } from '../../../../shared/components/go-back/go-back.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [
    MatTableModule, GoBackComponent,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule, MatCardModule
  ]
})
export class UserListComponent implements OnInit, AfterViewInit {
  private userService = inject(UtilisateurService);
  private dialog = inject(MatDialog);

  dataSource = new MatTableDataSource<UtilisateurProfil>();
  displayedColumns = ['username', 'email', 'actions'];

  goBackButtons: GoBackButton[] = [];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadUsers();
    this.goBackButtons = [
      {
        label: 'Ajouter un utilisateur',
        icon: 'add',
        class: 'btn-primary',
        show: true,
        action: () => this.openCreateUserDialog()
      }
    ];
  }

  loadUsers(): void {
    this.userService.getUserProfiles().subscribe(users => {
      this.dataSource.data = users;
    });
  }

  openEditDialog(user: Utilisateur): void {
    const dialogRef = this.dialog.open(CreateUserComponent, {
      width: '700px',
      data:
      {
        user: user,
        update: true
      }
    });
  }


  openCreateUserDialog(): void {
    this.dialog.open(CreateUserComponent, {
      width: '700px'
    })
      .afterClosed().subscribe(() => this.loadUsers());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
