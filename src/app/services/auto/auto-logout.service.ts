import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService {

    // private inactivityTime = 2 * 60 * 1000; // 2 minutes
  private inactivityTime = 15 * 60 * 1000; // 15 minutes
  private timeoutId: any;

  constructor(private router: Router, private ngZone: NgZone) {
    this.initListener();
    this.resetTimer();
  }

  // Écoute les événements utilisateur pour réinitialiser le timer
  private initListener() {
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetTimer());
    });
  }

  // Réinitialise le timer
  resetTimer() {
    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => this.logout());
      }, this.inactivityTime);
    });
  }

  // Déconnexion automatique
  logout() {
    localStorage.removeItem('token'); // Supprime le token
    alert('Vous avez été déconnecté pour inactivité.');
    this.router.navigate(['/login']);
  }
}
