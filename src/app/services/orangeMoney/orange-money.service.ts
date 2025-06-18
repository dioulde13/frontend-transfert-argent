import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrangeMoneyService {

  // URL de l'API
  private apiUrl = 'https://sfvb-gebbbgbsg-bb44ccvbdnfsdgn3.up.railway.app';
  // private apiUrl = 'http://localhost:3000'; 


  constructor(private http: HttpClient) {}

  // Méthode pour récupérer les données de l'API
  getAllOrangeMoney(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/orangeMoney/liste`);
  }

  // Méthode pour ajouter une nouvelle entrée
  ajouterOrangeMoney(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/orangeMoney/create`, data);
  }

  validerOrangeMOney(reference: number, data: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/api/orangeMoney/valider/${reference}`,
      data
    );
  }
}
