import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddActionDialogComponent } from './add-action-dialog.component';

describe('AddActionDialogComponent', () => {
  let component: AddActionDialogComponent;
  let fixture: ComponentFixture<AddActionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddActionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
