import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInPageInitialDataComponent } from './create-in-page-initial-data.component';

describe('CreateInPageInitialDataComponent', () => {
  let component: CreateInPageInitialDataComponent;
  let fixture: ComponentFixture<CreateInPageInitialDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateInPageInitialDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateInPageInitialDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
