import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  private apiUrl = `${environment.API_URL}/api/banners`;

  constructor(private http: HttpClient) {}

  getBanners() {
    return this.http.get<any>(`${this.apiUrl}/images`).pipe(
      map(response => {
        const bannerArray = Object.entries(response.banners).map(([filename, data]: [string, any]) => ({
          filename: data.filename,
          image: `${environment.API_URL}${data.path}`,
          active: data.active,
          createdAt: data.createdAt,
          order: data.order
        }));
        return bannerArray.sort((a, b) => a.order - b.order);
      })
    );
  }
}