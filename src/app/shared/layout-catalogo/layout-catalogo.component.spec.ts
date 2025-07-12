import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutCatalogoComponent } from './layout-catalogo.component';

describe('LayoutCatalogoComponent', () => {
  let component: LayoutCatalogoComponent;
  let fixture: ComponentFixture<LayoutCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutCatalogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
