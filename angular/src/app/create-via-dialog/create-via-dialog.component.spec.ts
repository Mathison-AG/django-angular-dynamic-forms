import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateViaDialogComponent } from './create-via-dialog.component';

describe('CreateViaDialogComponent', () => {
  let component: CreateViaDialogComponent;
  let fixture: ComponentFixture<CreateViaDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateViaDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateViaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
