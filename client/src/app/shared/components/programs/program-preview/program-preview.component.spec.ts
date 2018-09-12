import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramPreviewComponent } from './program-preview.component';

describe('ProgramPreviewComponent', () => {
  let component: ProgramPreviewComponent;
  let fixture: ComponentFixture<ProgramPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
