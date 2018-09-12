import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentAttemptResultComponent } from './assessment-attempt-result.component';

describe('AssessmentAttemptResultComponent', () => {
  let component: AssessmentAttemptResultComponent;
  let fixture: ComponentFixture<AssessmentAttemptResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentAttemptResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentAttemptResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
