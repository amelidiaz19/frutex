import { Component, OnInit} from '@angular/core';
import { ProductosService } from '../../services/productos.service';
import { CommonModule } from '@angular/common';
import { FiltroService } from '../../services/filtro.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-catalogo',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './layout-catalogo.component.html',
  styleUrl: './layout-catalogo.component.css'
})
export class LayoutCatalogoComponent implements OnInit {

  isFilterOpen = false;
  
  keywords: string[] = [];
  selectedKeywords: string[] = [];
  isLoadingKeywords = false;

  constructor(
    private productosService: ProductosService,
    private filtroService: FiltroService
  ) {}

  ngOnInit() {
    this.loadKeywords();
  }

  loadKeywords() {
    this.isLoadingKeywords = true;
    this.productosService.getAllKeywords().subscribe({
      next: (keywords) => {
        this.keywords = keywords;
        this.isLoadingKeywords = false;
      },
      error: (error) => {
        console.error('Error loading keywords:', error);
        this.isLoadingKeywords = false;
      }
    });
  }

  toggleKeyword(keyword: string) {
    const index = this.selectedKeywords.indexOf(keyword);
    if (index === -1) {
      this.selectedKeywords.push(keyword);
    } else {
      this.selectedKeywords.splice(index, 1);
    }
    this.filtroService.updateFilters(this.selectedKeywords);
  }

  clearFilters() {
    this.selectedKeywords = [];
    this.filtroService.updateFilters([]);
  }

}
