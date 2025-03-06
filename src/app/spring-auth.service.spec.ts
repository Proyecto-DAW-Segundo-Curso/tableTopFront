import { TestBed } from '@angular/core/testing';

import { SpringAuthService } from './spring-auth.service';

describe('SpringAuthService', () => {
  let service: SpringAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpringAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
