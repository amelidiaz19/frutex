import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CarritoService, CartItem } from '../../services/carrito.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { initFlowbite } from 'flowbite';
import { PedidoService } from '../../services/pedido.service';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit  {

  private isBrowser: boolean;
  isAuthenticated = false;
  showSuccessModal = false;

  cartItems: CartItem[] = [];
  customerInfo = {
    nombre: '',
    apellido: '',
    dni_cliente: '',
    email: '',
    telefono: '',
    direccion: {
      calle: '',
      numero: '',
      distrito: '',
      referencia: ''
    },
    metodoPago: 'efectivo', // efectivo, yape, plin, transferencia
    tipoEntrega: 'recojo', // recojo, delivery
    notas: ''
  };

  constructor(
    private cartService: CarritoService,
    private authService: AuthService,
    private router: Router,
    private pedidoService: PedidoService,
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.seoService.updateMetadata({
      title: 'Carrito de Compras',
      description: 'Revisa y gestiona los productos en tu carrito de compras antes de realizar tu pedido.',
      keywords: 'carrito compras, checkout, pedido online'
    });
    
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      initFlowbite();

      const pendingOrder = localStorage.getItem('pendingOrder');
      if (pendingOrder) {
        this.showSuccessModal = true;
      }
    }

    // Check authentication status
    this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        if (!isAuth) {
          // Optionally store the return URL
          this.authService.setReturnUrl('/carrito');
        }
      }
    );
    
    // Get cart items
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
    });

    // Get user info if logged in
    const user = this.authService.getCurrentUser();
    if (user) {
      this.customerInfo = {
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        dni_cliente: user.dni|| '',
        email: user.email || '',
        telefono: user.telefono || '',
        direccion: {
          calle: user.direccion?.calle || '',
          numero: user.direccion?.numero || '',
          distrito: user.direccion?.distrito || '',
          referencia: user.direccion?.referencia || ''
        },
        metodoPago: user.metodoPago|| 'efectivo',
        tipoEntrega: user.tipoEntrega || 'recojo',
        notas: ''
      };
    }
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  showErrors = false;

  isFormValid(): boolean {
    const isValid = !!(
      this.customerInfo.nombre &&
      this.customerInfo.apellido &&
      this.customerInfo.dni_cliente &&
      this.customerInfo.telefono &&
      this.isValidDNI(this.customerInfo.dni_cliente) &&
      this.isValidPhone(this.customerInfo.telefono) &&
      (this.customerInfo.tipoEntrega === 'recojo' || 
        (this.customerInfo.direccion.calle && 
         this.customerInfo.direccion.distrito))
    );
    
    return isValid;
  }

  isValidDNI(dni_cliente: string | number): boolean {
    if (!dni_cliente) return false;
    const dniValue = dni_cliente.toString();
    return dniValue.length === 8 && /^\d{8}$/.test(dniValue);
  }

  isValidPhone(phone: string): boolean {
    return phone?.length === 9 && /^\d+$/.test(phone);
  }

  validateForm(event: Event): void {
    event.preventDefault();
    this.showErrors = true;
  }

  removeFromCart(itemId: number, tipo_venta: string) {
    this.cartService.removeFromCart(itemId, tipo_venta);
  }

  handleWhatsAppClick(event: Event): void {
    if (!this.isFormValid()) {
      event.preventDefault();
      this.validateForm(event);
    }
  }

  crearPedido() {
    // Format cart items to match the required structure
    const orderItems = this.cartItems.map(item => ({
      id_producto: Number(item.id_producto),
      cantidad: Number(item.cantidad),
      precio_unitario: Number(item.precio),
      tipo_venta: item.tipo_venta
    }));

    // Create order data object
    const orderData = {
      items: orderItems,
      total: Number(this.getTotal().toFixed(2)),
      metodoPago: this.customerInfo.metodoPago,
      tipoEntrega: this.customerInfo.tipoEntrega,
      notas: this.customerInfo.notas || '',
      direccion: this.customerInfo.tipoEntrega === 'delivery' ? {
        calle: this.customerInfo.direccion.calle,
        numero: this.customerInfo.direccion.numero,
        distrito: this.customerInfo.direccion.distrito,
        referencia: this.customerInfo.direccion.referencia
      } : undefined
    };

    // Send order to backend
    this.pedidoService.createOrder(orderData).subscribe({
      next: (response) => {
        if (response.success) {
          console.log(response);
          this.showSuccessModal = true;
          if (this.isBrowser) {
            localStorage.setItem('pendingOrder', 'true');
          }
        } else {
          console.error('Error al crear el pedido');
        }
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.cartService.clearCart();
    if (this.isBrowser) {
      localStorage.removeItem('pendingOrder');
    }
    this.router.navigate(['/cliente/pedidos']);
  }

  getWhatsAppLink(): string {
    const phoneNumber = '51960790657';
    let message = '¡Hola! Quisiera confirmar mi pedido:\n\n';
    message += `*Datos del Cliente*\n`;
    message += `Nombre: ${this.customerInfo.nombre} ${this.customerInfo.apellido}\n`;
    message += `DNI: ${this.customerInfo.dni_cliente}\n`;
    message += `Teléfono: ${this.customerInfo.telefono}\n`;
    message += `Email: ${this.customerInfo.email}\n\n`;
    
    message += `*Tipo de Entrega*: ${this.customerInfo.tipoEntrega === 'delivery' ? 'Delivery' : 'Recojo en tienda'}\n`;
    if (this.customerInfo.tipoEntrega === 'delivery') {
      message += `Dirección: ${this.customerInfo.direccion.calle} ${this.customerInfo.direccion.numero}\n`;
      message += `Distrito: ${this.customerInfo.direccion.distrito}\n`;
      message += `Referencia: ${this.customerInfo.direccion.referencia}\n\n`;
    }

    message += `*Método de Pago*: ${this.customerInfo.metodoPago}\n\n`;
    
    message += `*Productos:*\n`;
    this.cartItems.forEach(item => {
      message += `• ${item.nombre}\n`;
      message += `  Cantidad: ${item.cantidad} ${item.tipo_venta}\n`;
      message += `  Precio: S/${item.precio} c/u\n`;
      message += `  Subtotal: S/${(item.precio * item.cantidad).toFixed(2)}\n\n`;
    });
    
    message += `*Total del pedido: S/${this.getTotal().toFixed(2)}*\n\n`;
    
    if (this.customerInfo.notas) {
      message += `*Notas adicionales:*\n${this.customerInfo.notas}\n`;
    }

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }

  whatsappSent = false;

  whatsappClicked() {
    this.whatsappSent = true;
  }

}
