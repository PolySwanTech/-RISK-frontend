import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuProcessAccordionComponent } from './bu-process-accordion.component';

describe('BuProcessAccordionComponent', () => {
  let component: BuProcessAccordionComponent;
  let fixture: ComponentFixture<BuProcessAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuProcessAccordionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuProcessAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
