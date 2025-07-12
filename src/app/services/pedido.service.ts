import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PedidoItem {
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  tipo_venta: string;
  subtotal: number;
}

export interface Pedido {
  id: number;
  fecha: string;
  estado: string;
  total: number;
  metodoPago: string;
  tipoEntrega: string;
  notas: string;
  items: PedidoItem[];
  direccion?: {
    calle: string;
    numero: string;
    distrito: string;
    referencia: string;
  };
}

export interface PedidoResponse {
  success: boolean;
  pedidos: Pedido[];
}

export interface CreateOrderItem {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  tipo_venta: string;
}

export interface CreateOrderData {
  items: CreateOrderItem[];
  total: number;
  metodoPago: string;
  tipoEntrega: string;
  notas: string;
  direccion?: {
    calle: string;
    numero: string;
    distrito: string;
    referencia: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private apiUrl = `${environment.API_URL}/api/pedido`;

  constructor(private http: HttpClient) { }
  
  createOrder(orderData: CreateOrderData): Observable<{ success: boolean; idPedido: number }> {
    return this.http.post<{ success: boolean; idPedido: number }>(`${this.apiUrl}/crear`, orderData);
  }

  getClientOrders(): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.apiUrl}/cliente`);
  }
}
