import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRisksComponent } from './create-risks.component';

describe('CreateRisksComponent', () => {
  let component: CreateRisksComponent;
  let fixture: ComponentFixture<CreateRisksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRisksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRisksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
