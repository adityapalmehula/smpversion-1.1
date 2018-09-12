import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayContentVideoComponent } from './play-content-video.component';

describe('PlayContentVideoComponent', () => {
  let component: PlayContentVideoComponent;
  let fixture: ComponentFixture<PlayContentVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayContentVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayContentVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
