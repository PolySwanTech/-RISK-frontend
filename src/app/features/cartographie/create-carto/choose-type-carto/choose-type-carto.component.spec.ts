import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseTypeCartoComponent } from './choose-type-carto.component';

describe('ChooseTypeCartoComponent', () => {
  let component: ChooseTypeCartoComponent;
  let fixture: ComponentFixture<ChooseTypeCartoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseTypeCartoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseTypeCartoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
