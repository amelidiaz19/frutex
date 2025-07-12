import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent implements OnInit{

  constructor(
    private router: Router,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.seoService.updateMetadata({
      title: 'Página no encontrada (404)',
      description: 'La página que estás buscando no existe o ha sido movida.',
    }); 
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goSupport() {
    console.log('goSupport');
  }
}