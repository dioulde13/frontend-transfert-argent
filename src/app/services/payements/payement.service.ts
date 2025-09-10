import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environnement/environnement';

@Injectable({
  providedIn: 'root'
})
export class PayementService {

  // URL de l'API
  // private apiUrl = 'https://sfvb-gebbbgbsg-bb44ccvbdnfsdgn3.up.railway.app'; 
  // private apiUrl = 'http://localhost:3000'; 
  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient) { }


  updatePayement(payement: any) {
    return this.http.put(`${this.apiUrl}/api/payement/modifier/${payement.id}`, payement);
  }

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
