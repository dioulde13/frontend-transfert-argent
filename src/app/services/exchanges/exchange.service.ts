import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environnement/environnement';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllExchange(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/exchange/liste`);
  }

  ajouterExchange(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/exchange/create`, data);
  }

}
