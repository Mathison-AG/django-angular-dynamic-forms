import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateViaDialogMultipleFormsComponent } from './create-via-dialog-multiple-forms.component';

describe('CreateViaDialogMultipleFormsComponent', () => {
  let component: CreateViaDialogMultipleFormsComponent;
  let fixture: ComponentFixture<CreateViaDialogMultipleFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateViaDialogMultipleFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateViaDialogMultipleFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
