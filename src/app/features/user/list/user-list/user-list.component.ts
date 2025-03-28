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
import { UpdateUserPopUpComponent } from '../../update/update-user-pop-up/update-user-pop-up.component';

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
  private dialog = inject(MatDialog);

  dataSource = new MatTableDataSource<UtilisateurProfil>();
  displayedColumns = ['username', 'email', 'equipeName', 'role', 'actions'];

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

  openEditDialog(user: UtilisateurProfil): void {
    const dialogRef = this.dialog.open(UpdateUserPopUpComponent, {
      width: '400px',
      data: user
    });
  
    dialogRef.afterClosed().subscribe(updated => {
      if (updated) {
        console.log('📌 Données avant modification :', user);
        console.log('✏️ Données modifiées :', updated);
  
        const payload = {
          username: updated.username,
          role: updated.role,
          equipeId: updated.equipeId
        };
  
        this.userService.updateUser(user.id, payload).subscribe({
          next: () => {
            console.log('✅ Utilisateur mis à jour avec succès !');
            this.loadUsers();
          },
          error: (err) => {
            console.error('❌ Erreur lors de la mise à jour', err);
          }
        });
      } else {
        console.log('⛔ Modification annulée.');
      }
    });
  }
  

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
