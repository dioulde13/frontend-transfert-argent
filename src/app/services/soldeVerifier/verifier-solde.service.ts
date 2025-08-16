import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environnement/environnement';

@Injectable({
  providedIn: 'root'
})
export class VerifierSoldeService {

  // private apiUrl = 'https://sfvb-gebbbgbsg-bb44ccvbdnfsdgn3.up.railway.app';
  // private apiUrl = 'http://localhost:3000'; 
   private apiUrl = environment.apiUrl; 


  constructor(private http: HttpClient) { } 

  // Méthode pour récupérer les données de l'API
  getAllVerifierCaisse(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/verifierCaisse/liste`);
  }

  getAllVerifierCaisseParJours(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/verifierCaisse/listeParJours`);
  }
  // Méthode pour ajouter Verifier caisse
  ajouterVerifierCaisse(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/verifierCaisse/create`, data);
  }

}
