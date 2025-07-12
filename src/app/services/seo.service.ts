import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  updateMetadata(metadata: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
  }) {
    // Set title
    if (metadata.title) {
      this.title.setTitle(`${metadata.title} | FrutexPeru`);
    }

    // Update meta tags
    if (metadata.description) {
      this.meta.updateTag({ name: 'description', content: metadata.description });
    }

    if (metadata.keywords) {
      this.meta.updateTag({ name: 'keywords', content: metadata.keywords });
    }

    // Open Graph tags
    if (metadata.title) {
      this.meta.updateTag({ property: 'og:title', content: metadata.title });
    }

    if (metadata.description) {
      this.meta.updateTag({ property: 'og:description', content: metadata.description });
    }

    if (metadata.image) {
      this.meta.updateTag({ property: 'og:image', content: metadata.image });
    }

    // Add canonical URL
    if (isPlatformBrowser(this.platformId)) {
      const baseUrl = environment.production ? 'https://importaciones-sarmiento.com' : window.location.origin;
      const path = window.location.pathname;
      const canonicalUrl = `${baseUrl}${path}`;

      this.meta.updateTag({ 
        property: 'og:url', 
        content: canonicalUrl 
      });
      
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }
  }
}