import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultCartographieComponent } from './result-cartographie.component';

describe('ResultCartographieComponent', () => {
  let component: ResultCartographieComponent;
  let fixture: ComponentFixture<ResultCartographieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultCartographieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultCartographieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
