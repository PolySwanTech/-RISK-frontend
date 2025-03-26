import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectEntitiesComponent } from './select-entities.component';

describe('SelectEntitiesComponent', () => {
  let component: SelectEntitiesComponent;
  let fixture: ComponentFixture<SelectEntitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectEntitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectEntitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
