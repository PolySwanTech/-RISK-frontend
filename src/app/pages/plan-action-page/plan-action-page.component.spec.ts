import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanActionPageComponent } from './plan-action-page.component';

describe('PlanActionPageComponent', () => {
  let component: PlanActionPageComponent;
  let fixture: ComponentFixture<PlanActionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanActionPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanActionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
