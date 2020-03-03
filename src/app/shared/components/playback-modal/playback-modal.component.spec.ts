import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaybackModalComponent } from '@src/app/shared/components/playback-modal/playback-modal.component';

describe('PlaybackModalComponent', () => {
  let component: PlaybackModalComponent;
  let fixture: ComponentFixture<PlaybackModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaybackModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaybackModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
