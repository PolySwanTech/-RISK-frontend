import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamProcessComponent } from './param-process.component';

describe('ParamProcessComponent', () => {
  let component: ParamProcessComponent;
  let fixture: ComponentFixture<ParamProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParamProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParamProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
