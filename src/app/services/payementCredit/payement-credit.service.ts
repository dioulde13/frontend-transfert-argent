import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PayementCreditService {

  // URL de l'API
      private apiUrl = 'http://localhost:3000'; 
    
      constructor(private http: HttpClient) { }
    
       // Méthode pour récupérer les données de l'API
       getAllPayementCredit(): Observable<any> {
        return this.http.get(`${this.apiUrl}/api/payementCredit/liste`);
      }
       // Méthode pour ajouter un partenaire
    ajouterPayementCredit(payementCreditData: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/api/payementCredit/create`, payementCreditData);
    }
}
