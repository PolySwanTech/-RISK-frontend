import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private isClosed = new BehaviorSubject<boolean>(false);
  isClosed$ = this.isClosed.asObservable();

  toggle() {
    this.isClosed.next(!this.isClosed.value);
  }

}