import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrangeMoneyComponent } from './orange-money.component';

describe('OrangeMoneyComponent', () => {
  let component: OrangeMoneyComponent;
  let fixture: ComponentFixture<OrangeMoneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrangeMoneyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrangeMoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
