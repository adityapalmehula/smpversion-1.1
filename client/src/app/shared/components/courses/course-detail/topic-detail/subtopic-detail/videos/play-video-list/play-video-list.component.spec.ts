import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayVideoListComponent } from './play-video-list.component';

describe('PlayVideoListComponent', () => {
  let component: PlayVideoListComponent;
  let fixture: ComponentFixture<PlayVideoListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayVideoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayVideoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
