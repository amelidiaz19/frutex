import { Component, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dark-mode',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dark-mode.component.html',
  styleUrl: './dark-mode.component.css'
})
export class DarkModeComponent {
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const win = this.document.defaultView;
      const isDark = localStorage?.getItem('theme') === 'dark' || 
        (!localStorage?.getItem('theme') && win?.matchMedia?.('(prefers-color-scheme: dark)')?.matches);
      
      if (isDark) {
        this.document.documentElement.classList.add('dark');
      } else {
        this.document.documentElement.classList.remove('dark');
      }
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showScrollButton = false;

  @HostListener('window:scroll')
  onWindowScroll() {
  if (isPlatformBrowser(this.platformId)) {
    this.showScrollButton = window.scrollY > 300;
  }
  }

  toggleDarkMode() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.document.documentElement.classList.contains('dark')) {
        this.document.documentElement.classList.remove('dark');
        localStorage?.setItem('theme', 'light');
      } else {
        this.document.documentElement.classList.add('dark');
        localStorage?.setItem('theme', 'dark');
      }
    }
  }
}