import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ProductosService } from '../../services/productos.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environments';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { FiltroService } from '../../services/filtro.service';
import { combineLatest } from 'rxjs';
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
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent implements OnInit{

  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;
  allProducts: Producto[] = [];
  paginatedProducts: Producto[] = [];
  searchTerm: string = ''; 

  // Loading and error states
  isLoading = false;
  error: string | null = null;
  private currentKeywords: string[] = [];

  constructor(
    private productosService: ProductosService,
    private seoService: SeoService,
    private filtroService: FiltroService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {

    this.updateSEO();
    
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Subscribe to both filter and search params
    combineLatest([
      this.filtroService.selectedKeywords$,
      this.route.queryParams
    ]).subscribe(([keywords, params]) => {
      this.currentKeywords = keywords;
      this.searchTerm = params['search'] || '';
      this.currentPage = 1;
      this.loadProducts(keywords, this.searchTerm);
    });
  }

  loadProducts(keywords: string[] = [], searchTerm?: string) {
    this.isLoading = true;
    this.productosService.getFilteredProducts(keywords, this.currentPage, this.itemsPerPage, searchTerm)
      .subscribe({
        next: (response) => {
          this.paginatedProducts = response.productos;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar los productos';
          this.isLoading = false;
          console.error('Error:', error);
        }
      });
  }

  nextPage() {

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts(this.currentKeywords, this.searchTerm);
      this.updateSEO();
    }
  }

  previousPage() {

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts(this.currentKeywords, this.searchTerm);
      this.updateSEO();
    }
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

  updateSEO() {
    this.seoService.updateMetadata({
      title: 'Catálogo de Productos',
    });
  }

}
