import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRiskComponent } from './create-risk.component';

describe('CreateRiskComponent', () => {
  let component: CreateRiskComponent;
  let fixture: ComponentFixture<CreateRiskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRiskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
