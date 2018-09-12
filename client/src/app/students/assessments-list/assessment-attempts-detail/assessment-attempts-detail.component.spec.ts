import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentAttemptsDetailComponent } from './assessment-attempts-detail.component';

describe('AssessmentAttemptsDetailComponent', () => {
  let component: AssessmentAttemptsDetailComponent;
  let fixture: ComponentFixture<AssessmentAttemptsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentAttemptsDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentAttemptsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
