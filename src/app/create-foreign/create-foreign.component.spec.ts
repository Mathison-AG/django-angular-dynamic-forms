import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateForeignComponent } from './create-foreign.component';

describe('CreateForeignComponent', () => {
  let component: CreateForeignComponent;
  let fixture: ComponentFixture<CreateForeignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateForeignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateForeignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
