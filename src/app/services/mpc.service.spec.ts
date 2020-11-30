import { TestBed } from '@angular/core/testing';

import { MpcService } from './mpc.service';

describe('MpcService', () => {
  let service: MpcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MpcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
