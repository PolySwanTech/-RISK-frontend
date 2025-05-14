import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRiskComponent } from './list-risk.component';

describe('ListRiskComponent', () => {
  let component: ListRiskComponent;
  let fixture: ComponentFixture<ListRiskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListRiskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
