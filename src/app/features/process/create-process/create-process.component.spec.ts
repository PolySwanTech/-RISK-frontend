import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProcessComponent } from './create-process.component';

describe('CreateProcessComponent', () => {
  let component: CreateProcessComponent;
  let fixture: ComponentFixture<CreateProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
