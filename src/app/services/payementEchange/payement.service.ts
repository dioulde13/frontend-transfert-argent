import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environnement/environnement';

@Injectable({
  providedIn: 'root'
})
export class PayementEchangeService {

// URL de l'API
  //  private apiUrl = 'https://transferer-hasla-gui-cfyacgvau.up.railway.app'; 
  // private apiUrl = 'http://localhost:3000'; 
   private apiUrl = environment.apiUrl; 

 
   constructor(private http: HttpClient) { }

   getComptePayemenEchange(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/payementEchange/compte`);
  }
 
    // Méthode pour récupérer les données de l'API
    getAllPayementEchange(): Observable<any> {
     return this.http.get(`${this.apiUrl}/api/payementEchange/liste`);
   }

    // Méthode pour ajouter une nouvelle entrée
  ajouterPayemnentEchange(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/payementEchange/create`, data);
  }

}
