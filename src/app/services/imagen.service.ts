import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {

  private apiUrl = environment.API_URL + '/api/imagen';

  constructor(private http: HttpClient) {}

  getProductImages(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/producto/${productId}`);
  }
}
