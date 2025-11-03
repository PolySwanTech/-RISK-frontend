import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { Draft, DraftService } from '../../../core/services/draft.service';

@Component({
  selector: 'app-draft-banner',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './draft-banner.component.html',
  styleUrls: ['./draft-banner.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(20px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ transform: 'translateX(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class DraftBannerComponent implements OnInit {
  private draftService = inject(DraftService);
  drafts$!: Observable<Draft[]>;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.drafts$ = this.draftService.visibleDrafts$;
  }

  ngAfterViewInit(): void {
    const container = this.scrollContainer.nativeElement;
    container.addEventListener('wheel', (event) => {
      if (event.deltaY !== 0) {
        event.preventDefault();
        container.scrollLeft += event.deltaY;
      }
    });
  }

  onRestore(draft: Draft): void {
    const event = new CustomEvent('restoreDraft', {
      detail: draft,
      bubbles: true,
      composed: true
    });
    window.dispatchEvent(event);
  }

  onDelete(draft: Draft): void {
    this.draftService.deleteDraft(draft.id);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes === 1) return 'Il y a 1 minute';
    if (minutes < 60) return `Il y a ${minutes} minutes`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Il y a 1 heure';
    if (hours < 24) return `Il y a ${hours} heures`;

    const days = Math.floor(hours / 24);
    if (days === 1) return 'Il y a 1 jour';
    return `Il y a ${days} jours`;
  }
}