
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { PartenaireOMService } from '../../services/partenaireOM/partenaire-om.service';

@Component({
  selector: 'app-partenaire-om',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule,
  ],
  templateUrl: './partenaire-om.component.html',
  styleUrl: './partenaire-om.component.css'
})
export class PartenaireOMComponent implements OnInit {
  // Tableau pour stocker les résultats
  allresultat: any[] = [];

  userInfo: any = null;
  idUser: string = '';

  partenaireForm!: FormGroup;

  dtoptions: any = {};


  dtTrigger: Subject<any> = new Subject<any>();

  selectPaye: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private partenaireService: PartenaireOMService
  ) {}

  ngOnInit(): void {
    this.dtoptions = {
      paging: true, // Activer la pagination
      pagingType: 'full_numbers', // Type de pagination
      pageLength: 10, // Nombre d'éléments par page
    };
    this.partenaireFormIntial();
    this.getAllPartenaire();
    this.getUserInfo(); // Récupération des infos utilisateur
  }

  private partenaireFormIntial(): void {
    // Initialisation du formulaire avec les validations
    this.partenaireForm = this.fb.group({
      utilisateurId: [this.idUser], // Liaison utilisateurId
      nom: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]],
    });
  }


  getUserInfo() {
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        this.userInfo = response.user;
        //   if (this.userInfo) {
        this.idUser = this.userInfo.id;
        console.log('Informations utilisateur:', this.userInfo);

        // Mettre à jour le champ utilisateurId dans le formulaire
        this.partenaireForm.patchValue({ utilisateurId: this.idUser });
      },
    });
  }

  getAllPartenaire() {
    // Appel à l'API et gestion des réponses
    this.partenaireService.getAllPartenaireOM().subscribe({
      next: (response) => {
        this.allresultat = response;
        console.log(this.allresultat);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données', error);
      },
    });
  }
  isLoading: boolean = false;

  montant: number = 0;

  onInputChange(event: any): void {
    this.montant = event.target.value.replace(/[^0-9,]/g, '');
  }

  onSubmit() {
    if (this.partenaireForm.valid) {
      const formData = this.partenaireForm.value;
      console.log(formData);
      this.isLoading = true;
      this.partenaireService
        .ajouterPartenaireOM(formData)
        .subscribe(
          (response) => {
            this.isLoading = false;
            console.log('Partenaire ajouté avec succès:', response);
            this.partenaireForm.patchValue({
              nom: '',
              montant: '',
            });
            this.getAllPartenaire();
            alert('Partenaire ajouté avec succès!');
          },
          (error) => {
            this.isLoading = false;
            console.error("Erreur lors de l'ajout du partenaire:", error);
            alert("Erreur lors de l'ajout du partenaire.");
          }
        );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}
