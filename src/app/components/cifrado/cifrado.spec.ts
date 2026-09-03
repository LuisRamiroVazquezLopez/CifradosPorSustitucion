import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cifrado } from './cifrado';

describe('Cifrado', () => {
  let component: Cifrado;
  let fixture: ComponentFixture<Cifrado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cifrado],
    }).compileComponents();

    fixture = TestBed.createComponent(Cifrado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
