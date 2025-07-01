import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlDetailsPageComponent } from './control-details-page.component';

describe('ControlDetailsPageComponent', () => {
  let component: ControlDetailsPageComponent;
  let fixture: ComponentFixture<ControlDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlDetailsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
