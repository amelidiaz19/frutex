import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltroService {

  private selectedKeywordsSubject = new BehaviorSubject<string[]>([]);
  selectedKeywords$ = this.selectedKeywordsSubject.asObservable();

  updateFilters(keywords: string[]) {
    this.selectedKeywordsSubject.next(keywords);
  }
}
