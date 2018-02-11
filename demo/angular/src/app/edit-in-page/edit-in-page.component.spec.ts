import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditInPageComponent } from './edit-in-page.component';

describe('EditInPageComponent', () => {
  let component: EditInPageComponent;
  let fixture: ComponentFixture<EditInPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditInPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
