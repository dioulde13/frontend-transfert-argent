import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private apiUrl = 'http://localhost:3000/api/benefices'; // URL de l'API Node.js

  constructor(private http: HttpClient) {}

  // 📊 Méthode pour calculer le bénéfice entre deux dates
  getBenefice(dateDebut: string, dateFin: string): Observable<any> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.get(`${this.apiUrl}/benefice`, { params });
  }

}
