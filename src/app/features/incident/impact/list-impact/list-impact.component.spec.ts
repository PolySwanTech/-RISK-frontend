import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListImpactComponent } from './list-impact.component';

describe('ListImpactComponent', () => {
  let component: ListImpactComponent;
  let fixture: ComponentFixture<ListImpactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListImpactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListImpactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
