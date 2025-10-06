import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environnement/environnement';

@Injectable({
  providedIn: 'root'
})
export class EntreServiceService {

  // private apiUrl = 'https://sfvb-gebbbgbsg-bb44ccvbdnfsdgn3.up.railway.app'; 
  // private apiUrl = 'http://localhost:3000';
   private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }


  updateEntre(entre: any) {
  return this.http.put(`${this.apiUrl}/api/entrees/modifier/${entre.id}`, entre);
}


  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      // Ici, tu peux gérer l'absence de token, par exemple lancer une erreur ou retourner un header vide
      throw new Error('Token non trouvé. Veuillez vous reconnecter.');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  annulerEntreParCode(code: string, type_annuler: string, montant_rembourser: number): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { type_annuler, montant_rembourser };
    return this.http.put(`${this.apiUrl}/api/entrees/annuler/${code}`, body, );
  }

  getData(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/devises/liste`);
  }
  //   getAllEntree(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/api/entrees/liste`);
  // }

getAllEntree(startDate?: string, endDate?: string): Observable<any> {
  let url = `${this.apiUrl}/api/entrees/liste`;

  if (startDate && endDate) {
    // Format YYYY-MM-DD attendu côté backend
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }

  return this.http.get(url);
}



  getCompteEntrees(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/entrees/compte`);
  }

  ajouterEntree(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/api/entrees/create`, data);
  }

  ajouterEntreeAutres(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/api/entrees/createAutre`, data);
  }

}
