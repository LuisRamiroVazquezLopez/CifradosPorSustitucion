import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CifradoComponent } from './cifrado';

describe('CifradoComponent', () => {
  let component: CifradoComponent;
  let fixture: ComponentFixture<CifradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CifradoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CifradoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
