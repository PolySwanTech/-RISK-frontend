import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculViewComponent } from './calcul-view.component';

describe('CalculViewComponent', () => {
  let component: CalculViewComponent;
  let fixture: ComponentFixture<CalculViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
