import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Incident } from '../../../core/models/Incident';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-list',
  imports: [MatButtonModule, MatTableModule, MatSortModule,
    MatCardModule, MatPaginatorModule, MatFormFieldModule, MatInputModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit, AfterViewInit {

  columns = [
    {
      columnDef: 'id',
      header: 'ID.',
      cell: (element: Incident) => `#${element.id}`,
    },
    {
      columnDef: 'dateDeclaration',
      header: 'Date de déclaration',
      cell: (element: Incident) => `${element.dateDeclaration.toString().split('T')[0]}`,
    },
    {
      columnDef: 'entiteImpacteName',
      header: 'Entité impacté',
      cell: (element: Incident) => `${element.entiteImpacte[0]?.name}`,
      sortBy : (element : Incident) => `${element.entiteImpacte[0]?.name}`
    }, 
    {
      columnDef: 'state',
      header: 'Etat',
      cell: (element: Incident) => `${element.state}`,
    }, 

  ];

  displayedColumns = this.columns.map(c => c.columnDef);

  dataSource = new MatTableDataSource<Incident>([]);

  selectedIncident: Incident | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    // If the value is empty, reset the filter to include all rows
    if (!filterValue) {
      this.dataSource.filter = '';
    } else {
      // Use a custom filter predicate to filter by the entire object converted to string
      this.dataSource.filterPredicate = (data: Incident, filter: string) => {
        return this.customFilterPredicate(data, filter);
      };

      // Apply the filter to the data source
      this.dataSource.filter = filterValue;
    }

    // If paginator is available, reset to the first page
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  customFilterPredicate(data: Incident, filter: string): boolean {
    // Convert the entire object (including nested objects) to a string and check if it contains the filter term
    const stringifiedData = JSON.stringify(data).toLowerCase();  // Convert the entire data object to a string
    return stringifiedData.includes(filter.toLowerCase()); // Check if the filter term is present in the stringified object
  }



  loadIncidents() {
    this.incidentService.loadIncidents().subscribe(data => {
      this.dataSource.data = data.concat(data).concat(data);
    });
  }

  add() {
    this.router.navigate(
      ['incident', 'create']
    );
  }


}
