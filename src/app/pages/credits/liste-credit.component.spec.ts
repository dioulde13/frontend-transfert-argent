import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeCreditComponent } from './liste-credit.component';

describe('ListeCreditComponent', () => {
  let component: ListeCreditComponent;
  let fixture: ComponentFixture<ListeCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeCreditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
