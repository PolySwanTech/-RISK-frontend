import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldWithTooltipComponent } from './field-with-tooltip.component';

describe('FieldWithTooltipComponent', () => {
  let component: FieldWithTooltipComponent;
  let fixture: ComponentFixture<FieldWithTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldWithTooltipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldWithTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
