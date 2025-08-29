import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubMenuCartoComponent } from './sub-menu-carto.component';

describe('SubMenuCartoComponent', () => {
  let component: SubMenuCartoComponent;
  let fixture: ComponentFixture<SubMenuCartoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubMenuCartoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubMenuCartoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
