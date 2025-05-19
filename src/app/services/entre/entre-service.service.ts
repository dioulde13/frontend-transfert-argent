import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntreServiceService {

   private apiUrl = 'http://localhost:3000'; 
 
   constructor(private http: HttpClient) { }
 

   annulerEntreParCode(code: string, type_annuler: string, montant_rembourser: number): Observable<any> {
    const body = { type_annuler, montant_rembourser };
    return this.http.put(`${this.apiUrl}/api/entrees/annuler/${code}`, body);
  }
     getData(): Observable<any> {
     return this.http.get(`${this.apiUrl}/api/devises/liste`);
   }
    getAllEntree(): Observable<any> {
     return this.http.get(`${this.apiUrl}/api/entrees/liste`);
   }
    getCompteEntrees(): Observable<any> {
      return this.http.get(`${this.apiUrl}/api/entrees/compte`);
    }
  ajouterEntree(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/entrees/create`, data);
  }
  ajouterEntreeAutres(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/entrees/createAutre`, data);
  } 
}
