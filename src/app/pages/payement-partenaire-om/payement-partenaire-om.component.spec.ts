import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayementPartenaireOMComponent } from './payement-partenaire-om.component';

describe('PayementPartenaireOMComponent', () => {
  let component: PayementPartenaireOMComponent;
  let fixture: ComponentFixture<PayementPartenaireOMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayementPartenaireOMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayementPartenaireOMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
