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
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Utilisateur } from '../../../../core/models/Utilisateur';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class UserListComponent implements OnInit, AfterViewInit {
  private userService = inject(UtilisateurService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  dataSource = new MatTableDataSource<UtilisateurProfil>();
  displayedColumns = ['username', 'email', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadUsers();
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
    const dialogRef = this.dialog.open(CreateUserComponent, {
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(u => {
      if (u) {
        this.authService.register(u).subscribe({
          next: () => {
            alert("✅ Utilisateur créé !");
            this.loadUsers();
          },
          error: () => {
            alert("❌ Une erreur est survenue");
          }
        });
      }
    });
  }



  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
