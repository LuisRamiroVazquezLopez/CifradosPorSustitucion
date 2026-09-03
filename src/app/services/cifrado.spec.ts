import { TestBed } from '@angular/core/testing';

import { Cifrado } from './cifrado';

describe('Cifrado', () => {
  let service: Cifrado;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cifrado);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
