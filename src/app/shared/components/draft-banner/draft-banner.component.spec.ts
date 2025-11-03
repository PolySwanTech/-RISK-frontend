import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftBannerComponent } from './draft-banner.component';

describe('DraftBannerComponent', () => {
  let component: DraftBannerComponent;
  let fixture: ComponentFixture<DraftBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
