import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SortieService {
  private apiUrl = 'https://sfvb-gebbbgbsg-bb44ccvbdnfsdgn3.up.railway.app';
  // private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  getCompteSortie(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/api/sorties/compte`, { headers });
  }

  getAllSortie(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/api/sorties/liste`, { headers });
  }

  ajouterSortie(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/api/sorties/create`, data, { headers });
  }

  annulerSortie(code: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // Pas de corps, donc null en second argument
    return this.http.put(`${this.apiUrl}/api/sorties/annuler/${code}`, null, { headers }); 
  }

  validerSortie(code: number, data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // data en corps, headers en options
    return this.http.put(`${this.apiUrl}/api/sorties/valider/${code}`, data, { headers });
  }

  ajouterSortieAutres(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/api/sorties/ajouterAutre`, data, { headers });
  }
}
