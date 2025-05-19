import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateurs/utilisateur.service';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.css',
})
export class InscriptionComponent implements OnInit {
  userForm!: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private utilisateurService: UtilisateurService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.userForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      // sign: ['', Validators.required],
      // sign_dollar: ['', Validators.required],
      // sign_euro: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  addUser(): void {
    if (this.userForm.invalid) {
      alert('Veuillez remplir correctement le formulaire.');
      return;
    }

    console.log(this.userForm);

    this.isSubmitting = true;
    this.utilisateurService.addUser(this.userForm.value).subscribe({
      next: () => {
        alert('Utilisateur ajouté avec succès !');
        this.userForm.reset();
        this.isSubmitting = false;
        this.router.navigate(['/login']); // Redirection après connexion
      },
      error: (error) => {
        alert(error.error?.message || 'Une erreur est survenue.');
        console.error('Erreur :', error);
        this.isSubmitting = false;
      },
    });
  }
}
