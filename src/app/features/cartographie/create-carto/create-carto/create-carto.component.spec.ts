import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCartoComponent } from './create-carto.component';

describe('CreateCartoComponent', () => {
  let component: CreateCartoComponent;
  let fixture: ComponentFixture<CreateCartoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCartoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCartoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
