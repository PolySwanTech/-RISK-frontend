import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasePopupComponent } from './base-popup.component';

describe('BasePopupComponent', () => {
  let component: BasePopupComponent;
  let fixture: ComponentFixture<BasePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
