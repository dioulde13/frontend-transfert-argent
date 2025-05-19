import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayementEchangeComponent } from './payement-echange.component';

describe('PayementEchangeComponent', () => {
  let component: PayementEchangeComponent;
  let fixture: ComponentFixture<PayementEchangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayementEchangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayementEchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
