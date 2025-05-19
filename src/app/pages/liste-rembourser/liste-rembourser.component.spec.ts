import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeRembourserComponent } from './liste-rembourser.component';

describe('ListeRembourserComponent', () => {
  let component: ListeRembourserComponent;
  let fixture: ComponentFixture<ListeRembourserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeRembourserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeRembourserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
