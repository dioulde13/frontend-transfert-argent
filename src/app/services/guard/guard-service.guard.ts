import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Vérifier si l'utilisateur est authentifié et si le token n'est pas expiré
    if (this.authService.isAuthenticated()) {
      return true; // Accès autorisé
    } else {
      // Redirige vers la page de login avec un paramètre de retour (facultatif)
      this.authService.logout(); // Supprimer le token si expiré
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false; // Bloque l'accès
    }
  }
}
