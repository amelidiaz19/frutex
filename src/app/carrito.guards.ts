import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CarritoService } from './services/carrito.service';
import { map, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoGuard implements CanActivate {
  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {}

  canActivate() {
    return this.carritoService.getCartItems().pipe(
      take(1),
      map(items => {
        if (items.length === 0) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }
}