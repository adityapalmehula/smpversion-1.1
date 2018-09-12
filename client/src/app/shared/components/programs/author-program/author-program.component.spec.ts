import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorProgramComponent } from './author-program.component';

describe('AuthorProgramComponent', () => {
  let component: AuthorProgramComponent;
  let fixture: ComponentFixture<AuthorProgramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorProgramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
