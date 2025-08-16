import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environnement/environnement';

@Injectable({
  providedIn: 'root'
})
export class DeviseService {

 // URL de l'API
    //  private apiUrl = 'https://sfvb-gebbbgbsg-bb44ccvbdnfsdgn3.up.railway.app'; 
  // private apiUrl = 'http://localhost:3000'; 
   private apiUrl = environment.apiUrl; 

   
     constructor(private http: HttpClient) { }
   
      // Méthode pour récupérer les données de l'API
      getAllDevise(): Observable<any> {
       return this.http.get(`${this.apiUrl}/api/devises/liste`);
     }
        // Méthode pour ajouter un partenaire
    ajouterDevise(deviseData: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/api/devises/create`, deviseData);
    }

    // ✅ Méthode pour modifier une devise existante
  modifierDevise(id: number, deviseData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/devises/devise/${id}`, deviseData);
  }
}
