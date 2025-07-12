import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mi-cuenta.component.html',
  styleUrl: './mi-cuenta.component.css'
})
export class MiCuentaComponent implements OnInit {

  cliente: any = null;
  isEditing = false;
  editForm: FormGroup;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private seoService: SeoService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      direccion: this.fb.group({
        calle: [''],
        numero: [''],
        distrito: [''],
        referencia: ['']
      }),
      metodoPago: [''],
      tipoEntrega: [''],
      notas: ['']
    });
  }

  ngOnInit() {

    this.seoService.updateMetadata({
      title: 'Mi Cuenta',
      description: 'Gestiona tu información personal, direcciones de entrega y preferencias de compra.',
      keywords: 'cuenta cliente, perfil usuario, configuración cuenta'
    });

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cliente = this.authService.getCurrentUser();
    if (this.cliente) {
      this.editForm.patchValue({
        nombre: this.cliente.nombre,
        apellido: this.cliente.apellido,
        email: this.cliente.email,
        telefono: this.cliente.telefono,
        direccion: this.cliente.direccion,
        metodoPago: this.cliente.metodo_pago,
        tipoEntrega: this.cliente.tipo_entrega,
        notas: this.cliente.notas
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editForm.patchValue({
        nombre: this.cliente.nombre,
        apellido: this.cliente.apellido,
        email: this.cliente.email,
        telefono: this.cliente.telefono,
        direccion: {
          calle: this.cliente.direccion?.calle || '',
          numero: this.cliente.direccion?.numero || '',
          distrito: this.cliente.direccion?.distrito || '',
          referencia: this.cliente.direccion?.referencia || ''
        },
        metodoPago: this.cliente.metodoPago || '',
        tipoEntrega: this.cliente.tipoEntrega || '',
        notas: this.cliente.notas || ''
      });
    } else {
      this.editForm.reset();
    }
  }

  onSubmit() {
    if (this.editForm.valid) {
      this.authService.updateProfile(this.editForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            this.cliente = response.cliente;
            this.isEditing = false;
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/cliente/cuenta']);
            });
          }
        },
        error: (error) => {
          console.error('Error updating profile:', error);
        }
      });
    }
  }

}
