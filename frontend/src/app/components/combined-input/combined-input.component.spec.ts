import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinedInputComponent } from './combined-input.component';

describe('CombinedInputComponent', () => {
  let component: CombinedInputComponent;
  let fixture: ComponentFixture<CombinedInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombinedInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CombinedInputComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
