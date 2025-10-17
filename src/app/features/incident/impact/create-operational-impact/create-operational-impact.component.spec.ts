import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOperationalImpactComponent } from './create-operational-impact.component';

describe('CreateOperationalImpactComponent', () => {
  let component: CreateOperationalImpactComponent;
  let fixture: ComponentFixture<CreateOperationalImpactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOperationalImpactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOperationalImpactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
