import { 
    HttpInterceptorFn, 
    HttpRequest, 
    HttpHandlerFn, 
    HttpEvent,
    HttpErrorResponse
  } from '@angular/common/http';
  import { inject } from '@angular/core';
  import { catchError, Observable, throwError } from 'rxjs';
  import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
  
  export const authInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>, 
    next: HttpHandlerFn
  ): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const router = inject(Router);
  
    const token = authService.getAuthToken();
  
    console.log('Interceptor - Request URL:', request.url);
    console.log('Interceptor - Token:', token);
  
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  
    return next(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
  
        if (error.status === 401) {
          console.warn('Sesión expirada - redirigiendo al login');
          authService.logout();
          router.navigate(['/login'], {
            queryParams: { 
              sessionExpired: 'true' 
            }
          });
        }
        
        return throwError(() => error);
      })
    );
  };