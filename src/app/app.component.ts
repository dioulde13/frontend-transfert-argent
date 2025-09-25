import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AutoLogoutService } from './services/auto/auto-logout.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // corrigé ici
})
export class AppComponent {
  title = 'frontend-transfert-argent';

  constructor(private autoLogoutService: AutoLogoutService) {
    // Le service démarre automatiquement le timer et écoute l'activité utilisateur
  }
}
