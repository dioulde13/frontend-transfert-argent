import { Router, RouterLink } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void { }

  // Méthode pour gérer la connexion
  login(): void {
    this.isLoading = true; // Activer l'indicateur de chargement
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log(response);
        this.authService.saveToken(response.token);
        this.router.navigate(['/dashboard']); // Redirection après connexion
      },
      error: (err) => {
        this.isLoading = false; // Désactiver l'indicateur de chargement
        // this.errorMessage = err.error.message || 'Erreur lors de la connexion.';
        console.log(err);
      },
      complete: () => {
        this.isLoading = false; // S'assurer de désactiver le chargement une fois l'appel terminé
      },
    });
  }
}
