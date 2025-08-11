import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculInputParametersComponent } from './calcul-input-parameters.component';

describe('CalculInputParametersComponent', () => {
  let component: CalculInputParametersComponent;
  let fixture: ComponentFixture<CalculInputParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculInputParametersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculInputParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
