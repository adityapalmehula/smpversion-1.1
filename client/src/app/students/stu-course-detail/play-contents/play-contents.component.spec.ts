import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayContentsComponent } from './play-contents.component';

describe('PlayContentsComponent', () => {
  let component: PlayContentsComponent;
  let fixture: ComponentFixture<PlayContentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayContentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
