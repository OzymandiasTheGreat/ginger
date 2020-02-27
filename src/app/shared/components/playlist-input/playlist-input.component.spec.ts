import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistInputComponent } from './playlist-input.component';

describe('PlaylistInputComponent', () => {
  let component: PlaylistInputComponent;
  let fixture: ComponentFixture<PlaylistInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaylistInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
