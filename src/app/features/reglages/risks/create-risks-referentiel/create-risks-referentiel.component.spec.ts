import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRisksReferentielComponent } from './create-risks-referentiel.component';

describe('CreateRisksReferentielComponent', () => {
  let component: CreateRisksReferentielComponent;
  let fixture: ComponentFixture<CreateRisksReferentielComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRisksReferentielComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRisksReferentielComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
