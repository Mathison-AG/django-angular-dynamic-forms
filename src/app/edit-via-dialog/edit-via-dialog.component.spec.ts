import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditViaDialogComponent } from './edit-via-dialog.component';

describe('EditViaDialogComponent', () => {
  let component: EditViaDialogComponent;
  let fixture: ComponentFixture<EditViaDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditViaDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditViaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
