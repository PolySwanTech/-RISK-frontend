import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private messageSubject = new BehaviorSubject<string | null>(null);
  public message$ = this.messageSubject.asObservable();

  show(message?: string) {
    this.isLoadingSubject.next(true);
    this.messageSubject.next(message || null);
  }

  hide() {
    this.isLoadingSubject.next(false);
    this.messageSubject.next(null);
  }
}