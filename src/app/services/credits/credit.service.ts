import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreditService {

  // URL de l'API
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Méthode pour récupérer les données de l'API
  getAllCredit(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/credit/liste`);
  }
  // Méthode pour ajouter un partenaire
  ajoutCredit(creditData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/credit/create`, creditData);
  }

  annulerCreditParCode(reference: string): Observable<any> {
    const body = { reference };
    return this.http.put(`${this.apiUrl}/api/credit/annuler`, body);
  }
}
