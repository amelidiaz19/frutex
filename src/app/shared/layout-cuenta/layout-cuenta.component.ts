import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout-cuenta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout-cuenta.component.html',
  styleUrl: './layout-cuenta.component.css'
})
export class LayoutCuentaComponent {

  constructor(private authService: AuthService, private router: Router) {}

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

}
