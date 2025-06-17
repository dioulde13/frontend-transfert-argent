import { TestBed } from '@angular/core/testing';

import { PartenaireOMService } from './partenaire-om.service';

describe('PartenaireOMService', () => {
  let service: PartenaireOMService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartenaireOMService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
