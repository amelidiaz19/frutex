import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Pedido, PedidoService } from '../../services/pedido.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedido.component.html',
  styleUrl: './pedido.component.css'
})
export class PedidoComponent implements OnInit{

  pedidos: Pedido[] = [];
  loading = false;
  error = '';

  constructor(
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private pedidoService: PedidoService
  ) {}

  ngOnInit() {
    this.seoService.updateMetadata({
      title: 'Mis Pedidos',
      description: 'Consulta el historial y estado de tus pedidos realizados.',
      keywords: 'pedidos, historial compras, seguimiento pedidos'
    });
    
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.cargarPedidos();
  }

  cargarPedidos() {
    this.loading = true;
    this.pedidoService.getClientOrders().subscribe({
      next: (response) => {
        this.pedidos = response.pedidos;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los pedidos';
        this.loading = false;
      }
    });
  }

}
