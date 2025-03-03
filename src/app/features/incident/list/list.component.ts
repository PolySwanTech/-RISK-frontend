import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Incident } from '../../../core/models/Incident';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-list',
  imports: [MatButtonModule, MatTableModule, MatCardModule, MatPaginatorModule, MatSortModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit, AfterViewInit {

  private _liveAnnouncer = inject(LiveAnnouncer);

  displayedColumns: string[] = ['id', 'dateDeclaration', 'dateSurvenance', 'entiteResponsable'];

  dataSource = new MatTableDataSource<Incident>([]);

  selectedIncident: Incident | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  totalIDS = 5

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private router: Router, private incidentService: IncidentService) {
  }

  ngOnInit(): void {
    this.loadIncidents();
  }

  // This method will be triggered when a row is clicked
  onRowClick(incident: Incident) {
    this.router.navigate(['incident', incident.id]);
    // if (this.selectedIncident === incident) {
    //   // If the same row is clicked again, toggle the impacts visibility
    //   this.selectedIncident = null;
    // } else {
    //   this.selectedIncident = incident;
    // }
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  loadIncidents() {
    this.incidentService.loadIncidents().subscribe(data => {
      this.dataSource.data = data.concat(data).concat(data);
      console.table(this.dataSource.data)
    });
  }

  add() {
    this.router.navigate(
      ['incident', 'create']
    );
  }


}
