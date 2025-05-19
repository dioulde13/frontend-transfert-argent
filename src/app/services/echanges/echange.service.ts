import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EchangeService {
// URL de l'API
   private apiUrl = 'http://localhost:3000'; 
 
   constructor(private http: HttpClient) { }

   getCompteEchange(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/echange/compte`);
  }
 
    // Méthode pour récupérer les données de l'API
    getAllEchange(): Observable<any> {
     return this.http.get(`${this.apiUrl}/api/echange/liste`);
   }

    // Méthode pour ajouter une nouvelle entrée
  ajouterEchange(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/echange/create`, data);
  }

  ajouterSoldePartenaire(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/echange/soldePartenaire`, data);
  }

  
}
