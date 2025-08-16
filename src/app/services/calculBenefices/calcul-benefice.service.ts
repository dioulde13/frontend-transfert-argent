import { Injectable } from '@angular/core';
import { HttpClient, HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environnement/environnement';

@Injectable({
  providedIn: 'root'
})
export class CalculBeneficeService {

  // private apiUrl = 'https://sfvb-gebbbgbsg-bb44ccvbdnfsdgn3.up.railway.app/api/calculBenefices';  // L'URL de votre API
  // private apiUrl = 'http://localhost:3000'; 
   private apiUrl = environment.apiUrl; 


  constructor(private http: HttpClient) {}

  calculerBenefice(dateDebut: string, dateFin: string, montant: number, prix_1: number, prix: number): Observable<any> {
    const body = { dateDebut, dateFin, montant, prix_1, prix };
    return this.http.post<any>(`${this.apiUrl}/benefice`, body);
  }

  getBenefice(dateDebut: string, dateFin: string): Observable<any> {
    const params = new HttpParams()
      .set('date_debut', dateDebut)
      .set('date_fin', dateFin);

    return this.http.get<any>(`${this.apiUrl}/benefice/authomatique`, { params });
  }

}
