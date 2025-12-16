import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpAjoutAnneeComponent } from './pop-up-ajout-annee.component';

describe('PopUpAjoutAnneeComponent', () => {
  let component: PopUpAjoutAnneeComponent;
  let fixture: ComponentFixture<PopUpAjoutAnneeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpAjoutAnneeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpAjoutAnneeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
