import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSuiviComponent } from './list-suivi.component';

describe('ListSuiviComponent', () => {
  let component: ListSuiviComponent;
  let fixture: ComponentFixture<ListSuiviComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSuiviComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSuiviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
