import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayementService {

 // URL de l'API
    private apiUrl = 'http://localhost:3000'; 
  
    constructor(private http: HttpClient) { }

    getComptePayement(): Observable<any> {
      return this.http.get(`${this.apiUrl}/api/payement/compte`);
    }
  
     // Méthode pour récupérer les données de l'API
     getAllPayement(): Observable<any> {
      return this.http.get(`${this.apiUrl}/api/payement/liste`);
    }
     // Méthode pour ajouter un partenaire
  ajouterPayement(payementData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/payement/create`, payementData);
  }
}
