import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorProjectComponent } from './author-project.component';

describe('AuthorProjectComponent', () => {
  let component: AuthorProjectComponent;
  let fixture: ComponentFixture<AuthorProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
