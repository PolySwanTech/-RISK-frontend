import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MethodologyCardComponent } from './methodology-card.component';

describe('MethodologyCardComponent', () => {
  let component: MethodologyCardComponent;
  let fixture: ComponentFixture<MethodologyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MethodologyCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MethodologyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
