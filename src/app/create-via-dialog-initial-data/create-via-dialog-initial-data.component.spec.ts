import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateViaDialogInitialDataComponent } from './create-via-dialog-initial-data.component';

describe('CreateViaDialogInitialDataComponent', () => {
  let component: CreateViaDialogInitialDataComponent;
  let fixture: ComponentFixture<CreateViaDialogInitialDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateViaDialogInitialDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateViaDialogInitialDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
