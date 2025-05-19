import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListePartenaireComponent } from './liste-partenaire.component';

describe('ListePartenaireComponent', () => {
  let component: ListePartenaireComponent;
  let fixture: ComponentFixture<ListePartenaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListePartenaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListePartenaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
