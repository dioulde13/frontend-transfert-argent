import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeDeviseComponent } from './liste-devise.component';

describe('ListeDeviseComponent', () => {
  let component: ListeDeviseComponent;
  let fixture: ComponentFixture<ListeDeviseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeDeviseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeDeviseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
