import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { environment } from '../../../environments/environments';
import { ImagenService } from '../../services/imagen.service';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent implements OnInit, OnDestroy {

  producto: any;
  loading = true;
  error: string | null = null;

  productImages: any[] = [];
  currentImageUrl: string | null = null;

  selectedPriceType: 'caja' | 'docena' | 'unidad' = 'unidad';
  quantity: number = 1;

  relatedProducts: any[] = [];

  // Add these new properties
  currentSlide = 0;
  private slideInterval: any;
  slideDelay = 4000;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductosService,
    private imagenService: ImagenService,
    private cartService: CarritoService,
    private ngZone: NgZone,
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  navigateToProduct(id: number, urlSlug: string) {
    this.router.navigate(['/producto', id, urlSlug])
      .then(() => {
        window.location.reload();
      });
  }

  ngOnInit() {
    
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.productoService.getProductById(parseInt(id)).subscribe({
        next: (data) => {
          this.producto = data;
          this.currentImageUrl = data.foto;
          this.loading = false;
          this.loadProductImages(parseInt(id));
          this.loadRelatedProducts(data.keywords);
          this.updateSEO();
        },
        error: (err) => {
          this.error = 'Error al cargar el producto';
          this.loading = false;
          console.error('Error:', err);
        }
      });
    } else {
      this.error = 'URL inválida';
      this.loading = false;
    }
  }

  loadProductImages(productId: number) {
    this.imagenService.getProductImages(productId).subscribe({
      next: (response) => {
        this.productImages = response.imagenes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading images:', err);
        this.loading = false;
      }
    });
  }

  setMainImage(image: any) {
    this.currentImageUrl = image.imagen_url;
  }

  getImageUrl(url: string): string {
    if (url?.startsWith('http')) {
      return url;
    }
    if (!url) {
      return 'error.svg';
    }

    return `${environment.IMG_URL}/uploads/${url}`;
  }

  handleImageError(event: any) {
    event.target.src = 'error.svg';
  }

  getDisplayedImageUrl(): string {
    return this.getImageUrl(this.currentImageUrl || this.producto?.foto || '');
  }

  calculateTotal(): number {
    const price = this.selectedPriceType === 'caja' 
      ? this.producto.precio_caja 
      : this.selectedPriceType === 'docena' 
        ? this.producto.precio_docena 
        : this.producto.precio_unidad;
    return Number((price * this.quantity).toFixed(2));
  }

  validarCantidad() {
    if (!this.producto) return;

    const unidadesPorCaja = this.producto.cantidad_por_caja ?? 0;
    const mitadCaja = Math.floor(unidadesPorCaja / 2);
    const stockDisponible = this.producto.stock_actual;

    // Reset quantity when changing price type
    this.quantity = 1;

    if (this.selectedPriceType === 'caja' && this.quantity < mitadCaja) {
      this.quantity = mitadCaja;
      this.showToast(`La cantidad mínima para precio por caja es ${mitadCaja} unidades`, 'blue');
    } 
    else if (this.selectedPriceType === 'docena' && this.quantity < 12) {
      this.quantity = 12;
      this.showToast('La cantidad mínima para precio por docena es 12 unidades', 'blue');
    }
    else if (this.selectedPriceType === 'unidad' && this.quantity >= 12) {
      this.quantity = 11;
      this.showToast('Para esta cantidad, debe usar precio por docena o caja', 'blue');
    }

    // Validate against stock
    if (this.quantity > stockDisponible) {
      this.quantity = stockDisponible;
      this.showToast('Se ha ajustado la cantidad al máximo disponible', 'blue');
    }
  }

  canShowCajaOption(): boolean {
    const unidadesPorCaja = this.producto?.cantidad_por_caja ?? 0;
    const mitadCaja = Math.floor(unidadesPorCaja / 2);
    return this.producto?.stock_actual >= mitadCaja;
  }

  canShowDocenaOption(): boolean {
    return this.producto?.stock_actual >= 12;
  }

  canShowUnidadOption(): boolean {
    return this.producto?.stock_actual >= 1;
  }

  showToastMessage = false;
  toastMessage = '';
  toastColor = 'blue';

  // Replace showToast method
  showToast(message: string, color: string = 'blue') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToastMessage = true;
    
    setTimeout(() => {
      this.showToastMessage = false;
    }, 3000);
  }

  getMinQuantity(): number {
    switch (this.selectedPriceType) {
      case 'caja':
        return Math.floor(this.producto.cantidad_por_caja / 2);
      case 'docena':
        return 12;
      default:
        return 1;
    }
  }

  getMaxQuantity(): number {
    const stockLimit = this.producto.stock_actual;
    switch (this.selectedPriceType) {
      case 'caja':
        return stockLimit;
      case 'docena':
        return Math.min(stockLimit, Math.floor(this.producto.cantidad_por_caja / 2) - 1);
      default: // unidad
        return Math.min(stockLimit, 11);
    }
  }

  isMinQuantity(): boolean {
    return this.quantity <= this.getMinQuantity();
  }

  isMaxQuantity(): boolean {
    return this.quantity >= this.getMaxQuantity();
  }

  increaseQuantity() {
    if (this.quantity < this.getMaxQuantity()) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > this.getMinQuantity()) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.producto || !this.selectedPriceType || !this.quantity) return;
  
    const price = this.selectedPriceType === 'caja' 
      ? this.producto.precio_caja 
      : this.selectedPriceType === 'docena' 
        ? this.producto.precio_docena 
        : this.producto.precio_unidad;
  
    this.cartService.addToCart({
      id_producto: this.producto.id,
      nombre: this.producto.nombre,
      codigo: this.producto.codigo,
      url_slug: this.producto.url_slug,
      precio: price,
      tipo_venta: this.selectedPriceType,
      cantidad: this.quantity
    });
  }

  updateSEO() {
    if (!this.producto) return;

    this.seoService.updateMetadata({
      title: this.producto.nombre,
      description: this.producto.descripcion?.substring(0, 155) || 'Producto de FrutexPeru',
      keywords: `${this.producto.keywords}, ${this.producto.codigo}`,
      image: this.getDisplayedImageUrl()
    });
  }

  private productSlideInterval: any;
  productSlideDelay = 4000;
  productGroups: any[] = [];

  startProductSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
    this.ngZone.runOutsideAngular(() => {
      this.slideInterval = setInterval(() => {
        this.ngZone.run(() => {
          if (!this.relatedProducts.length) return;
          const maxSlides = Math.ceil(this.relatedProducts.length / this.slidesPerView) - 1;
          this.currentSlide = (this.currentSlide + 1) % (maxSlides + 1);
        });
      }, this.slideDelay);
    });
  }

  stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  get slidesPerView(): number {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;      // mobile
      if (window.innerWidth < 768) return 2;      // tablet
      if (window.innerWidth < 1024) return 3;     // small desktop
      return 4;                                   // large desktop
    }
    return 1; // default for mobile
  }

  nextSlide() {
    if (!this.relatedProducts.length) return;
    
    const maxSlides = Math.ceil(this.relatedProducts.length / this.slidesPerView) - 1;
    this.currentSlide = (this.currentSlide + 1) % (maxSlides + 1);
    this.restartProductSlide();
  }

  prevSlide() {
    if (!this.relatedProducts.length) return;

    const maxSlides = Math.ceil(this.relatedProducts.length / this.slidesPerView) - 1;
    this.currentSlide = this.currentSlide === 0 ? maxSlides : this.currentSlide - 1;
    this.restartProductSlide();
  }

  private restartProductSlide() {
    if (isPlatformBrowser(this.platformId)) {
      this.startProductSlide();
    }
  }

  @HostListener('window:resize')
  onResize() {
    // Reset current slide position when screen size changes
    Object.keys(this.currentSlide).forEach(key => {
      this.currentSlide = 0;
    });
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  // Modify loadRelatedProducts method
  loadRelatedProducts(keywords: string) {
    if (!keywords) return;
    
    const keywordArray = keywords.split(',').map(k => k.trim());
    this.productoService.getRelatedProducts(keywordArray.join(','), this.producto.id).subscribe({
      next: (products) => {
        this.relatedProducts = products;
        if (this.relatedProducts.length > this.slidesPerView) {
          this.startProductSlide();
        }
      },
      error: (err) => {
        console.error('Error loading related products:', err);
      }
    });
  }

  onQuantityInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value);
    
    if (isNaN(value)) {
      this.quantity = this.getMinQuantity();
      return;
    }
    
    const min = this.getMinQuantity();
    const max = this.getMaxQuantity();
    
    if (value < min) value = min;
    if (value > max) value = max;
    
    this.quantity = value;
  }

}
