import { TestBed } from '@angular/core/testing';

import { RembourserService } from './rembourser.service';

describe('RembourserService', () => {
  let service: RembourserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RembourserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
