import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RembourserService {

  // URL de l'API
      private apiUrl = 'http://localhost:3000'; 
    
      constructor(private http: HttpClient) { }

      getCompteRembourser(): Observable<any> {
        return this.http.get(`${this.apiUrl}/api/rembourser/compte`);
      }
    
       // Méthode pour récupérer les données de l'API
       getAllRebourser(): Observable<any> {
        return this.http.get(`${this.apiUrl}/api/rembourser/liste`);
      }
       // Méthode pour ajouter un partenaire
    ajouterRembourser(rembourserData: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/api/rembourser/create`, rembourserData);
    }
}
