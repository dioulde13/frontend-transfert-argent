import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayementPartenaireOMService {

 // URL de l'API
    private apiUrl = 'https://sfvb-gebbbgbsg-bb44ccvbdnfsdgn3.up.railway.app'; 
  // private apiUrl = 'http://localhost:3000'; 

  
    constructor(private http: HttpClient) { }
  
     // Méthode pour récupérer les données de l'API
     getAllPayementPartenaireOM(): Observable<any> {
      return this.http.get(`${this.apiUrl}/api/payementPartenaireOm/liste`);
    }
     // Méthode pour ajouter un partenaire
  ajouterPayementPartenaireOM(payementpartenaireOMData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/payementPartenaireOm/create`, payementpartenaireOMData);
  }
} 
