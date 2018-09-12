import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpFeedbackComponent } from './help-feedback.component';

describe('HelpFeedbackComponent', () => {
  let component: HelpFeedbackComponent;
  let fixture: ComponentFixture<HelpFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
