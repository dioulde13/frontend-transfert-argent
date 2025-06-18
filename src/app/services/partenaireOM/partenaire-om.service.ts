import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartenaireOMService {

  // URL de l'API
    private apiUrl = 'https://sfvb-gebbbgbsg-bb44ccvbdnfsdgn3.up.railway.app'; 
  // private apiUrl = 'http://localhost:3000'; 

  
    constructor(private http: HttpClient) { }
  
     // Méthode pour récupérer les données de l'API
     getAllPartenaireOM(): Observable<any> {
      return this.http.get(`${this.apiUrl}/api/partenaireOm/liste`);
    }
     // Méthode pour ajouter un partenaire
  ajouterPartenaireOM(partenaireOMData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/partenaireOm/create`, partenaireOMData);
  }
}
