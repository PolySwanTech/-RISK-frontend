import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AverageImplementationDelayComponent } from './average-implementation-delay.component';

describe('AverageImplementationDelayComponent', () => {
  let component: AverageImplementationDelayComponent;
  let fixture: ComponentFixture<AverageImplementationDelayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AverageImplementationDelayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AverageImplementationDelayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
