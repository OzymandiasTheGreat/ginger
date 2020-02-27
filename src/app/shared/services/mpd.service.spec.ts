import { TestBed } from '@angular/core/testing';

import { MpdService } from './mpd.service';

describe('MpdService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MpdService = TestBed.get(MpdService);
    expect(service).toBeTruthy();
  });
});
