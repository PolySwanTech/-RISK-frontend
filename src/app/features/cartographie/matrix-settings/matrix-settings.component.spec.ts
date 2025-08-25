import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixSettingsComponent } from './matrix-settings.component';

describe('MatrixSettingsComponent', () => {
  let component: MatrixSettingsComponent;
  let fixture: ComponentFixture<MatrixSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatrixSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatrixSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
