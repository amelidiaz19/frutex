import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

interface Producto {
  id: number;
  codigo: string;
  descripcion: string;
  foto: string;
  cajas: number;
  cantidad_por_caja: number;
  stock_actual: number;
  precio_yuanes: string;
  porcentaje_ganancia: number;
  precio_costo_soles: string;
  precio_caja: string;
  precio_docena: string;
  precio_unidad: string;
  nombre: string;
  url_slug: string;
  keywords: string;
  estado: string;
  created_at: string;
  updated_at: string;
}

interface ProductResponse {
  totalProductos: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  productos: Producto[];
}

interface GroupedProducts {
  groups: {
    keyword: string;
    products: Producto[];
  }[];
  total: number;
}

interface PaginatedResponse {
  total: number;
  productos: Producto[];
  currentPage: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private apiUrl = environment.API_URL + '/api/productos';

  constructor(private http: HttpClient) { }

  getProductosByKeyword(): Observable<GroupedProducts> {
    const params = new HttpParams()
      .set('keywords', 'GASEOSA,REFRESCANTE,INTENSO')
      .set('limit', '50');

    return this.http.get<ProductResponse>(`${this.apiUrl}/ec/search`, { params }).pipe(
      map(response => {
       
        if (response && response.productos) {
          const targetKeywords = ['GASEOSA','REFRESCANTE','INTENSO'];
          const groupedProducts = response.productos.reduce((acc: Record<string, Producto[]>, product) => {
            const keywords = product.keywords.split(',').map(k => k.trim());
            keywords.forEach(keyword => {
              const matchingKeyword = targetKeywords.find(target => keyword.startsWith(target));
              if (matchingKeyword) {
                if (!acc[matchingKeyword]) {
                  acc[matchingKeyword] = [];
                }
                acc[matchingKeyword].push(product);
              }
            });
            return acc;
          }, {});

          return {
            groups: Object.entries(groupedProducts).map(([keyword, products]) => ({
              keyword,
              products: products.sort((a, b) => a.nombre.localeCompare(b.nombre))
            })),
            total: response.totalProductos
          };
        }
        return { groups: [], total: 0 };
      })
    );
  }

  getRelatedProducts(productKeywords: string, currentProductId: number, limit: number = 20): Observable<Producto[]> {
    const params = new HttpParams()
      .set('keywords', productKeywords)
      .set('exclude', currentProductId.toString())
      .set('limit', limit.toString());

    return this.http.get<ProductResponse>(`${this.apiUrl}/ec/search`, { params }).pipe(
      map(response => {
        if (response && response.productos) {
          return response.productos.sort(() => Math.random() - 0.5).slice(0, limit);
        }
        return [];
      })
    );
  }

  getFilteredProducts(selectedKeywords: string[] = [], page: number = 1, limit: number = 12, searchTerm?: string): Observable<PaginatedResponse> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('page', page.toString());

    if (searchTerm?.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    if (selectedKeywords.length > 0) {
      params = params.set('keywords', selectedKeywords.join(','));
    }
  
    const endpoint = (searchTerm || selectedKeywords.length > 0) ? 
      `${this.apiUrl}/ec/search` : 
      `${this.apiUrl}/ec`;

    return this.http.get<ProductResponse>(endpoint, { params }).pipe(
      map(response => {
        if (response && response.productos) {
          return {
            productos: response.productos,
            total: response.totalProductos,
            currentPage: page,
            totalPages: Math.ceil(response.totalProductos / response.pageSize)
          };
        }
        return { productos: [], total: 0, currentPage: 1, totalPages: 0 };
      })
    );
  }

  getProductById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/ec/search/${id}`);
  }

  getAllKeywords(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/ec/search/keywords`);
  }
  
}
