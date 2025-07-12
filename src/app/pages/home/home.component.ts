import { Component, HostListener, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BannerService } from '../../services/banner.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ProductosService } from '../../services/productos.service';
import { environment } from '../../../environments/environments';
import { SeoService } from '../../services/seo.service';

export interface Producto {
  id: number;
  codigo: string;
  descripcion: string;
  foto: string;
  stock_actual: number;
  precio_caja: string;
  precio_docena: string;
  precio_unidad: string;
  nombre: string;
  url_slug: string;
  keywords: string;
  estado: string;
}

export interface ProductGroup {
  keyword: string;
  products: Producto[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  // Banners
  banners: any[] = [];
  currentBannerSlide = 0;
  private bannerSlideInterval: any;
  bannerSlideDelay = 5000;

  // Products
  productGroups: ProductGroup[] = [];
  totalItems = 0;
  isLoading = false;
  error: string | null = null;
  currentSlideProduct: { [key: string]: number } = {};
  private productSlideInterval: any;
  productSlideDelay = 4000;

  constructor(
    private productosService: ProductosService,
    private bannerService: BannerService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private seoService: SeoService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {

    this.seoService.updateMetadata({
      title: 'Inicio',
      description: 'FrutexPeru - El sabor tradicional que estabas esperando.',
      image: 'https://importaciones-sarmiento.com/icon.png'
    });

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadBanners();
        this.loadProductGroups();
      }, 0);
    }
  }

  // Banner methods
  private loadBanners() {
    this.bannerService.getBanners().subscribe({
      next: (data) => {
        this.banners = [...data];
        if (isPlatformBrowser(this.platformId)) {
          this.startBannerSlide();
        }
      },
      error: (error) => {
        console.error('Error loading banners:', error);
      }
    });
  }

  private startBannerSlide() {
    if (this.bannerSlideInterval) {
      clearInterval(this.bannerSlideInterval);
    }
    this.ngZone.runOutsideAngular(() => {
      this.bannerSlideInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.nextBannerSlide();
        });
      }, this.bannerSlideDelay);
    });
  }

  nextBannerSlide() {
    this.currentBannerSlide = (this.currentBannerSlide + 1) % this.banners.length;
    this.restartBannerSlide();
  }

  prevBannerSlide() {
    this.currentBannerSlide = this.currentBannerSlide === 0 ? 
      this.banners.length - 1 : this.currentBannerSlide - 1;
    this.restartBannerSlide();
  }

  setBannerSlide(index: number) {
    this.currentBannerSlide = index;
    this.restartBannerSlide();
  }

  private restartBannerSlide() {
    if (isPlatformBrowser(this.platformId)) {
      this.startBannerSlide();
    }
  }

  // Product methods
  loadProductGroups() {
    this.isLoading = true;
    this.error = null;

    this.productosService.getProductosByKeyword().subscribe({
      next: (response) => {
        this.productGroups = response.groups;
        this.totalItems = response.total;
        this.isLoading = false;
        if (isPlatformBrowser(this.platformId)) {
          this.startProductSlide();
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Error al cargar los productos. Por favor, intente nuevamente.';
        this.isLoading = false;
      }
    });
  }

  startProductSlide() {
    if (this.productSlideInterval) {
      clearInterval(this.productSlideInterval);
    }
    this.ngZone.runOutsideAngular(() => {
      this.productSlideInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.productGroups.forEach(group => {
            if (!group.products) return;
            
            const maxSlides = Math.max(0, group.products.length - this.slidesPerView);
            const currentIndex = this.currentSlideProduct[group.keyword] || 0;
            
            this.currentSlideProduct[group.keyword] = currentIndex >= maxSlides ? 
              0 : currentIndex + 1;
          });
        });
      }, this.productSlideDelay);
    });
  }

  stopAutoSlide() {
    if (this.productSlideInterval) {
      clearInterval(this.productSlideInterval);
    }
  }

  nextProductSlide(groupKey: string) {
    const group = this.productGroups.find(g => g.keyword === groupKey);
    if (!group) return;
    
    const maxSlides = Math.max(0, group.products.length - this.slidesPerView);
    this.currentSlideProduct[groupKey] = Math.min(
      (this.currentSlideProduct[groupKey] || 0) + 1, 
      maxSlides
    );
    this.restartProductSlide();
  }

  prevProductSlide(groupKey: string) {
    const group = this.productGroups.find(g => g.keyword === groupKey);
    if (!group) return;

    this.currentSlideProduct[groupKey] = Math.max(
      (this.currentSlideProduct[groupKey] || 0) - 1, 
      0
    );
    this.restartProductSlide();
  }

  private restartProductSlide() {
    if (isPlatformBrowser(this.platformId)) {
      this.startProductSlide();
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.bannerSlideInterval) {
        clearInterval(this.bannerSlideInterval);
      }
      if (this.productSlideInterval) {
        clearInterval(this.productSlideInterval);
      }
    }
  }

  setProductSlide(keyword: string, index: number) {
    this.currentSlideProduct[keyword] = index;
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

  getImageUrl(url: string): string {
    if (url?.startsWith('http')) {
      return url;
    }
    return `${environment.IMG_URL}/uploads/img/${url}`;
  }

  handleImageError(event: any) {
    event.target.src = 'https://importaciones-sarmiento.com/error.svg';
  }

  @HostListener('window:resize')
  onResize() {
    // Reset current slide position when screen size changes
    Object.keys(this.currentSlideProduct).forEach(key => {
      this.currentSlideProduct[key] = 0;
    });
  }
}