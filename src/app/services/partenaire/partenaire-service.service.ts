import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environnement/environnement';

@Injectable({
  providedIn: 'root'
})
export class PartenaireServiceService {

 // URL de l'API
    // private apiUrl = 'https://sfvb-gebbbgbsg-bb44ccvbdnfsdgn3.up.railway.app'; 
  // private apiUrl = 'http://localhost:3000'; 
   private apiUrl = environment.apiUrl; 

  
    constructor(private http: HttpClient) { }
  
     // Méthode pour récupérer les données de l'API
     getAllPartenaire(): Observable<any> {
      return this.http.get(`${this.apiUrl}/api/partenaires/liste`);
    }
     // Méthode pour ajouter un partenaire
  ajouterPartenaire(partenaireData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/partenaires/create`, partenaireData);
  }
  rembourserDevise(id:number, dataRembourser:any): Observable<any>{
    return this.http.put(`${this.apiUrl}/api/partenaires/rembourserDevise/${id}`, dataRembourser);
  }

  modifierPartenaire(id: number, partenaireData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/partenaires/modifierPartenaire/${id}`, partenaireData);
  }
}
