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
  template: `
    <div class="draft-banner-container" #scrollContainer>
      <div 
        *ngFor="let draft of (drafts$ | async)" 
        class="draft-banner"
        [@slideIn]>
        <div class="draft-content">
          <mat-icon class="draft-icon">edit_note</mat-icon>
          <div class="draft-info">
            <span class="draft-title">{{ draft.title }}</span>
            <span class="draft-time">{{ getTimeAgo(draft.timestamp) }}</span>
          </div>
        </div>
        <div class="draft-actions">
          <button 
            mat-button 
            class="btn-restore"
            (click)="onRestore(draft)">
            <mat-icon>restore</mat-icon>
            Restaurer
          </button>
          <button 
            mat-icon-button 
            class="btn-delete"
            (click)="onDelete(draft)">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .draft-banner-container {
    position: fixed;
    bottom: 20px;
    margin-left: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: row;
    gap: 12px;
    max-width: 70%;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
        
        &:hover {
          background: #94a3b8;
        }
      }
    }

    .draft-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      gap: 16px;

      &:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
      }
    }

    .draft-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .draft-icon {
      color: var(--mat-sys-primary);
      font-size: 24px;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .draft-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .draft-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .draft-time {
      font-size: 12px;
      color: #64748b;
    }

    .draft-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .btn-restore {
      background: var(--mat-sys-primary) !important;
      color: white !important;
      font-size: 13px;
      font-weight: 500;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 4px;
      }
    }

    .btn-delete {
      color: #64748b;
      
      &:hover {
        color: #ef4444;
        background: #fef2f2;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    @media (max-width: 768px) {
      .draft-banner-container {
        left: 12px;
        right: 12px;
        max-width: unset;
      }

      .draft-banner {
        padding: 12px;
      }

      .btn-restore {
        font-size: 12px;
        padding: 6px 12px;
      }
    }
  `],
  animations: [
  trigger('slideIn', [
    transition(':enter', [
      style({ transform: 'translateY(100%)', opacity: 0 }),
      animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
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