import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInPageComponent } from './create-in-page.component';

describe('CreateInPageComponent', () => {
  let component: CreateInPageComponent;
  let fixture: ComponentFixture<CreateInPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateInPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateInPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
