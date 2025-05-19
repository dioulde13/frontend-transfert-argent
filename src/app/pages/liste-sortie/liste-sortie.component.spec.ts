import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeSortieComponent } from './liste-sortie.component';

describe('ListeSortieComponent', () => {
  let component: ListeSortieComponent;
  let fixture: ComponentFixture<ListeSortieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeSortieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeSortieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
