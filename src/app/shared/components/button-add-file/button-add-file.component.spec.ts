import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonAddFileComponent } from './button-add-file.component';

describe('ButtonAddFileComponent', () => {
  let component: ButtonAddFileComponent;
  let fixture: ComponentFixture<ButtonAddFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonAddFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonAddFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
