import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllControlsComponent } from './all-controls.component';

describe('AllControlsComponent', () => {
  let component: AllControlsComponent;
  let fixture: ComponentFixture<AllControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
