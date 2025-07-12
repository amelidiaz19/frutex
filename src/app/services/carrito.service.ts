import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id_producto: number;
  nombre: string;
  codigo: string;
  precio: number;
  url_slug: string;
  tipo_venta: 'caja' | 'docena' | 'unidad';
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private cartItems = new BehaviorSubject<CartItem[]>([]);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {

    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItems.next(JSON.parse(savedCart));
      }
    }
  }

  getCartItems() {
    return this.cartItems.asObservable();
  }

  addToCart(item: CartItem) {
    const currentItems = this.cartItems.value;
    const existingItemIndex = currentItems.findIndex(
      i => i.id_producto === item.id_producto && i.tipo_venta === item.tipo_venta
    );

    if (existingItemIndex > -1) {
      currentItems[existingItemIndex].cantidad += item.cantidad;
    } else {
      currentItems.push(item);
    }

    this.cartItems.next(currentItems);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(currentItems));
    }
  }

  removeFromCart(itemId: number, tipo_venta: string) {
    const currentItems = this.cartItems.value.filter(
      item => !(item.id_producto === itemId && item.tipo_venta === tipo_venta)
    );
    this.cartItems.next(currentItems);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(currentItems));
    }
  }

  clearCart() {
    this.cartItems.next([]);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('cart');
    }
  }
}
