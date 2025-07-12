import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SeoService } from '../../services/seo.service';

interface RegisterRequest {
  numero_documento: string;
  nombre: string;
  apellido: string;
  email: string;
  passwd: string;
  telefono: string;
  direccion: {
    calle: string;
    numero: string;
    distrito: string;
    referencia: string;
  };
  metodoPago: string;
  tipoEntrega: string;
  notas: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  showRegister = false;

  loginError = '';
  registerError = '';

  loginData = {
    email: '',
    passwd: ''
  };

  registerData = {
    numero_documento: '',
    nombre: '',
    apellido: '',
    email: '',
    passwd: '',
    telefono: '',
    direccion: {
      calle: '',
      numero: '',
      distrito: '',
      referencia: ''
    },
    metodoPago: 'efectivo',
    tipoEntrega: 'recojo', 
    notas: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
  }

  toggleRegister(show: boolean) {
    this.showRegister = show;
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnInit() {

    this.seoService.updateMetadata({
      title: 'Iniciar Sesión',
      description: 'Accede a tu cuenta para gestionar tus pedidos y preferencias de compra.',
      keywords: 'login, iniciar sesión, registro, cuenta cliente'
    });
    
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } 

    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'register') {
        this.showRegister = true;
      } else {
        this.showRegister = false;
      }
    });
  }

  onLogin() {

    if (!this.loginData.email || !this.loginData.passwd) {
      this.loginError = 'Email y contraseña son requeridos';
      return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.loginData.email)) {
      this.loginError = 'Por favor ingrese un email válido';
      return;
    }

    this.authService.login(this.loginData).subscribe({ 
      next: (response) => {
        if (response.success) {
          const storedToken = this.authService.checkStoredToken();
          
          if (!storedToken) {
            this.loginError = 'Error al almacenar el token de autenticación';
            return;
          }
          this.router.navigate(['/cliente/cuenta']);
        } else {
          this.loginError = response.message || 'Error al iniciar sesión';
        }
      },
      error: (error) => {
        this.loginError = error.error?.message || 'Credenciales inválidas';
      }
    });
  }

  onRegister() {
    if (!this.registerData.nombre || !this.registerData.apellido || !this.registerData.numero_documento) {
      this.registerError = 'Los campos nombre, apellido y DNI son obligatorios';
      return;
    }

    if (this.registerData.numero_documento.length !== 8) {
      this.registerError = 'El DNI debe tener 8 dígitos';
      return;
    }

    const registerRequest: RegisterRequest = {
      ...this.registerData
    };

    this.authService.register(registerRequest).subscribe({
      next: (cliente) => {
        this.showRegister = false;
        this.loginData = {
          email: this.registerData.email,
          passwd: this.registerData.passwd
        };
        
      },
      error: (error) => {
        console.error('Error al crear cuenta:', error);
        this.registerError = 'Error al crear cuenta';
      }
    });
  }
}
