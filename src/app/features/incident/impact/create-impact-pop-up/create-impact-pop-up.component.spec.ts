import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateImpactPopUpComponent } from './create-impact-pop-up.component';

describe('CreateImpactPopUpComponent', () => {
  let component: CreateImpactPopUpComponent;
  let fixture: ComponentFixture<CreateImpactPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateImpactPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateImpactPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
