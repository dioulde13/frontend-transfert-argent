import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeEntreComponent } from './liste-entre.component';

describe('ListeEntreComponent', () => {
  let component: ListeEntreComponent;
  let fixture: ComponentFixture<ListeEntreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeEntreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeEntreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
