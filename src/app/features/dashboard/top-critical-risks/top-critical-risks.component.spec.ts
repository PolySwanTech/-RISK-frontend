import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopCriticalRisksComponent } from './top-critical-risks.component';

describe('TopCriticalRisksComponent', () => {
  let component: TopCriticalRisksComponent;
  let fixture: ComponentFixture<TopCriticalRisksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopCriticalRisksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopCriticalRisksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
