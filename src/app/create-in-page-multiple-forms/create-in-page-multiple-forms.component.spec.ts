import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInPageMultipleFormsComponent } from './create-in-page-multiple-forms.component';

describe('CreateInPageMultipleFormsComponent', () => {
  let component: CreateInPageMultipleFormsComponent;
  let fixture: ComponentFixture<CreateInPageMultipleFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateInPageMultipleFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateInPageMultipleFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
