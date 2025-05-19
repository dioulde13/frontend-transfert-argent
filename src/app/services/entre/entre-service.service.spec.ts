import { TestBed } from '@angular/core/testing';

import { EntreServiceService } from './entre-service.service';

describe('EntreServiceService', () => {
  let service: EntreServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntreServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
