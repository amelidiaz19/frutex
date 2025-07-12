import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environments';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

interface Cliente {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: {  // Update structure to match what we need
    calle: string;
    numero: string;
    distrito: string;
    referencia: string;
  };
  metodoPago: string;
  tipoEntrega: string;
  notas: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentClienteSubject: BehaviorSubject<Cliente | null>;
  public currentCliente: Observable<Cliente | null>;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private returnUrl: string = '/';

  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    const storedCliente = this.isBrowser ? localStorage.getItem('currentCliente') : null;
    this.currentClienteSubject = new BehaviorSubject<Cliente | null>(
      storedCliente ? JSON.parse(storedCliente) : null
    );
    this.currentCliente = this.currentClienteSubject.asObservable();
    this.isAuthenticatedSubject.next(!!this.getAuthToken());
    this.initializeTokenCheck();
  }

  public get currentClienteValue(): Cliente | null {
    return this.currentClienteSubject.value;
  }

  private initializeTokenCheck() {
    if (this.isBrowser) {
      setInterval(() => {
        this.checkTokenExpiration();
      }, 60000);
    }
  }

  private checkTokenExpiration() {
    const token = this.getAuthToken();
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = tokenData.exp * 1000;
        
        if (Date.now() >= expirationTime) {
          this.logout();
          this.router.navigate(['/']);
        }
      } catch (error) {
        console.error('Token parsing error:', error);
        this.logout();
        this.router.navigate(['/']);
      }
    }
  }

  setReturnUrl(url: string) {
    this.returnUrl = url;
  }

  getReturnUrl(): string {
    return this.returnUrl;
  }

  login(credentials: { email: string, passwd: string }): Observable<any> {
    return this.http.post<{
      success: boolean,
      message: string,
      token: string,
      cliente: any
    }>(`${environment.API_URL}/api/clientewb/login`, credentials)
      .pipe(
        map(response => {
          if (response.success && response.token ) {
            if (this.isBrowser) {
              localStorage.setItem('token', response.token);
              localStorage.setItem('currentCliente', JSON.stringify(response.cliente));
              this.currentClienteSubject.next(response.cliente);
              this.isAuthenticatedSubject.next(true);
              this.checkTokenExpiration();
            }
          }
          return response;
        }),
        catchError(error => {
          console.error('Login Error:', error);
          return throwError(() => error);
        })
      );
  }

  checkStoredToken() {
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      console.log('Token Actual:', token);
      return token;
    }
    return null;
    
  }

  register(clienteData: {
    numero_documento: string;
    nombre: string;
    apellido: string;
    email: string;
    passwd: string;
    telefono?: string;
    direccion?: {
      calle: string;
      numero: string;
      distrito: string;
      referencia: string;
    };
    metodoPago?: string;
    tipoEntrega?: string;
    notas?: string;
  }): Observable<any> {
    return this.http.post<{
      message: string;
      cliente: Cliente;
    }>(`${environment.API_URL}/api/clientewb/crear`, clienteData)
      .pipe(
        map(response => {
          if (this.isBrowser) {
            localStorage.setItem('currentCliente', JSON.stringify(response.cliente));
          }
          this.currentClienteSubject.next(response.cliente);
          return response;
        }),
        catchError(error => {
          console.error('Register Error:', error);
          return throwError(() => error);
        })
      );
  }

  updateProfile(clienteData: {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    direccion?: {
      calle: string;
      numero: string;
      distrito: string;
      referencia: string;
    };
    metodoPago?: string;
    tipoEntrega?: string;
    notas?: string;
  }): Observable<any> {
    const token = this.getAuthToken();
    if (!token) {
      console.error('No token available');
      return throwError(() => new Error('No authentication token'));
    }
  
    if (!this.currentClienteValue?.dni) {
      console.error('No DNI available');
      return throwError(() => new Error('No DNI found'));
    }

    const transformedData = {
      ...clienteData,
      metodo_pago: clienteData.metodoPago,
      tipo_entrega: clienteData.tipoEntrega
    };
  
    return this.http.put<{
      success: boolean;
      message: string;
    }>(
      `${environment.API_URL}/api/clientewb/perfil/${this.currentClienteValue.dni}`,
      transformedData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    ).pipe(
      map(response => {
        if (response.success) {
          const updatedCliente: Cliente = {
            dni: this.currentClienteValue!.dni,
            nombre: clienteData.nombre,
            apellido: clienteData.apellido,
            email: clienteData.email,
            telefono: clienteData.telefono || this.currentClienteValue!.telefono,
            direccion: {
              calle: clienteData.direccion?.calle || this.currentClienteValue!.direccion.calle,
              numero: clienteData.direccion?.numero || this.currentClienteValue!.direccion.numero,
              distrito: clienteData.direccion?.distrito || this.currentClienteValue!.direccion.distrito,
              referencia: clienteData.direccion?.referencia || this.currentClienteValue!.direccion.referencia
            },
            metodoPago: clienteData.metodoPago || this.currentClienteValue!.metodoPago,
            tipoEntrega: clienteData.tipoEntrega || this.currentClienteValue!.tipoEntrega,
            notas: clienteData.notas || this.currentClienteValue!.notas
          };
  
          if (this.isBrowser) {
            localStorage.setItem('currentCliente', JSON.stringify(updatedCliente));
          }
          this.currentClienteSubject.next(updatedCliente);
        }
        return response;
      }),
      catchError(error => {
        console.error('Update Profile Error:', error);
        return throwError(() => error);
      })
    );
  }

  logout() {
    if (this.isBrowser) {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.removeItem('currentCliente');
      localStorage.removeItem('token');
    }
    this.currentClienteSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/']);
  }

  getAuthToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getAuthToken();
  }

  getCurrentUser(): Cliente | null {
    if (this.isBrowser) {
      const storedCliente = localStorage.getItem('currentCliente');
      if (storedCliente) {
        const cliente = JSON.parse(storedCliente);
        return cliente;
      }
    }
    return null;
  }
}
