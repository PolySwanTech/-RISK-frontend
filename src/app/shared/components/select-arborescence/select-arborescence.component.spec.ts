import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectArborescenceComponent } from './select-arborescence.component';

describe('SelectArborescenceComponent', () => {
  let component: SelectArborescenceComponent;
  let fixture: ComponentFixture<SelectArborescenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectArborescenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectArborescenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
