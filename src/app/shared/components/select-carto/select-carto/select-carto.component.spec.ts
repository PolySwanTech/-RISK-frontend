import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCartoComponent } from './select-carto.component';

describe('SelectCartoComponent', () => {
  let component: SelectCartoComponent;
  let fixture: ComponentFixture<SelectCartoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectCartoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectCartoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
