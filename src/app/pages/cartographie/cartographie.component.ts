import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { Cartography } from '../../core/models/Cartography';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { CartoService } from '../../core/services/carto/carto.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-cartographie',
  imports: [MatCardModule, CommonModule, FormsModule, GoBackComponent, 
    MatPaginatorModule, RouterModule,
    MatIconModule, MatTableModule, MatButtonModule, MatMenuModule],
  templateUrl: './cartographie.component.html',
  styleUrls: ['./cartographie.component.scss']
})
export class CartographieComponent implements OnInit, AfterViewInit {

  displayedColumns = [
    'name', 'exerciceYear', 'reference', 'bu', 'date', 'aggregation', 'actions'
  ];
  dataSource = new MatTableDataSource<Cartography>([]);
  loading = false;
  
  private router = inject(Router);
  private service = inject(CartoService);
  private dialog = inject(MatDialog);


  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  goBackButtons = [
    {
      label: 'Rafraichir',
      icon: 'refresh',
      class: 'btn-primary',
      show: true,
      action: () => this.fetch()
    },
    {
      label: 'Créer une cartographie',
      icon: 'add',
      class: 'btn-secondary',
      show: true,
      action: () => this.addCarto()
    }
  ];

  constructor(
  ) { }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: rows => {
        this.dataSource.data = rows;
        this.loading = false;
      },
      error: _ => this.loading = false
    });
  }

  openDetails(row: Cartography) {
    this.router.navigate(['/carto', row.id]); // route consultation
  }

  openDuplicate(row: Cartography) {
    // const ref = this.dialog.open(CartoDuplicateDialogComponent, {
    //   width: '460px',
    //   data: { source: row }
    // });

    // ref.afterClosed().subscribe(result => {
    //   if (!result) return;
    //   this.service.duplicateFrom(row, result).subscribe(newCarto => {
    //     // rafraîchir la liste et naviguer vers la nouvelle carto
    //     this.fetch();
    //     this.router.navigate(['/carto', newCarto.id]);
    //   });
    // });
  }

  levelChipClass(level?: string) {
    switch ((level || '').toUpperCase()) {
      case 'FAIBLE': return 'chip chip-green';
      case 'MOYEN': return 'chip chip-yellow';
      case 'ELEVE': return 'chip chip-orange';
      case 'CRITIQUE': return 'chip chip-red';
      default: return 'chip chip-grey';
    }
  }

  addCarto() {
    this.router.navigate(['cartographie', 'create']); // route création
  }
}
