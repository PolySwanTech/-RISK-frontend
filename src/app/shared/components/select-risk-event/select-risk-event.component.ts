import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { RiskService } from '../../../core/services/risk/risk.service';

@Component({
  selector: 'app-select-risk-event',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './select-risk-event.component.html',
  styleUrls: ['./select-risk-event.component.scss']
})
export class SelectRiskEventComponent implements OnInit {

  searchQuery = '';
  searchText = 'Rechercher un événement de risque...';
  showSearchResults = false;
  isSearching = false;
  searchResults: any[] = [];
  allEvents: any[] = [];
  public data = inject(MAT_DIALOG_DATA, { optional: true });
  processId?: string;

  constructor(
    private router: Router,
    private riskEventService: RiskService,
    private dialogRef: MatDialogRef<SelectRiskEventComponent>,
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.processId) {
      this.processId = this.data.processId;
      this.loadAllEvents(this.processId);
    } else{
      this.loadAllEvents();
    }
  }

  loadAllEvents(processId?: string): void {
    this.isSearching = true;
    this.riskEventService.getRisksTree(processId).subscribe({
      next: (events) => {
        this.allEvents = events;
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
      }
    });
  }

  onSearchInput(event: any): void {
    this.searchQuery = event.target.value.trim();
    if (this.searchQuery.length >= 2) {
      this.performSearch();
    } else {
      this.clearSearch();
    }
  }

  performSearch(): void {
    this.isSearching = true;
    this.showSearchResults = true;

    setTimeout(() => {
      this.searchResults = this.allEvents.filter(ev =>
        ev.libelle.toLowerCase().includes(this.searchQuery.toLowerCase())
      );

      this.isSearching = false;
    }, 300);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showSearchResults = false;
    this.searchResults = [];
  }

  selectEvent(event: any): void {
    this.dialogRef.close(event);
  }

  createNewEvent(): void {
    const queryParams: any = {
      redirect: this.router.url
    };

    if (this.searchQuery?.trim()) {
      queryParams.libelle = this.searchQuery.trim();
    }

    // Préremplir avec le processId si connu
    if (this.processId) {
      queryParams.processId = this.processId;
    }
    this.dialogRef.close();
    this.router.navigate(['reglages', 'risks', 'create'], { queryParams });
  }
}
