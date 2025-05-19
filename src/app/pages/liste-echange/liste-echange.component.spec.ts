import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeEchangeComponent } from './liste-echange.component';

describe('ListeEchangeComponent', () => {
  let component: ListeEchangeComponent;
  let fixture: ComponentFixture<ListeEchangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeEchangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeEchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
