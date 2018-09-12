import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorProjectDetailsComponent } from './author-project-details.component';

describe('AuthorProjectDetailsComponent', () => {
  let component: AuthorProjectDetailsComponent;
  let fixture: ComponentFixture<AuthorProjectDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorProjectDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorProjectDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
