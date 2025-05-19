import { TestBed } from '@angular/core/testing';

import { PartenaireServiceService } from './partenaire-service.service';

describe('PartenaireServiceService', () => {
  let service: PartenaireServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartenaireServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
