import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartenaireOMComponent } from './partenaire-om.component';

describe('PartenaireOMComponent', () => {
  let component: PartenaireOMComponent;
  let fixture: ComponentFixture<PartenaireOMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartenaireOMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartenaireOMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
