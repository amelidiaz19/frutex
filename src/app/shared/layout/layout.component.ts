import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { DarkModeComponent } from '../../components/dark-mode/dark-mode.component';
import { initFlowbite } from 'flowbite';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CarritoService, CartItem } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, DarkModeComponent, RouterLink, CommonModule, FormsModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {

  cartItems: CartItem[] = [];
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
  private cartService: CarritoService,
  private authService: AuthService,
  private router: Router) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      initFlowbite();

      this.cartService.getCartItems().subscribe(items => {
        this.cartItems = items;
      });
    }
  }

  removeFromCart(itemId: number, tipo_venta: string) {
    this.cartService.removeFromCart(itemId, tipo_venta);
  }

  logout(dropdownId: string) {
    this.authService.logout();
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
      dropdown.classList.add('hidden');
    }
    this.router.navigate(['/']);
  }

  closeDropdown(dropdownId: string) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
      dropdown.classList.add('hidden');
    }
  }

  searchQuery: string = '';

  searchProducts() {
    // Navigate to catalog with or without search query
    this.router.navigate(['/catalogo'], {
      queryParams: this.searchQuery.trim() ? { search: this.searchQuery.trim() } : {},
      onSameUrlNavigation: 'reload'
    }).then(() => {
      // Reset search if empty
      if (!this.searchQuery.trim()) {
        this.searchQuery = '';
      }
    });
  }

  onSearchChange(query: string) {
    if (!query || query.trim() === '') {
      this.searchQuery = '';
      this.router.navigate(['/catalogo'], {
        queryParams: {},
        onSameUrlNavigation: 'reload'
      });
    }
  }

}
