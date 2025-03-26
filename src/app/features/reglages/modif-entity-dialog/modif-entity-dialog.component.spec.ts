import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifEntityDialogComponent } from './modif-entity-dialog.component';

describe('ModifEntityDialogComponent', () => {
  let component: ModifEntityDialogComponent;
  let fixture: ComponentFixture<ModifEntityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifEntityDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifEntityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
