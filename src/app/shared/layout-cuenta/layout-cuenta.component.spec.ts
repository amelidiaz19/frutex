import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutCuentaComponent } from './layout-cuenta.component';

describe('LayoutCuentaComponent', () => {
  let component: LayoutCuentaComponent;
  let fixture: ComponentFixture<LayoutCuentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutCuentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
