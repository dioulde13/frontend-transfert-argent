import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { PartenaireOMService } from '../../services/partenaireOM/partenaire-om.service';
import { PayementPartenaireOMService } from '../../services/payementPartenaireOM/payement-partenaire-om.service';
import { CurrencyFormatPipe } from '../dasboard/currency-format.pipe';

@Component({
  selector: 'app-payement-partenaire-om',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule,
    CurrencyFormatPipe
  ],
  templateUrl: './payement-partenaire-om.component.html',
  styleUrl: './payement-partenaire-om.component.css'
})
export class PayementPartenaireOMComponent implements OnInit {
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
    private partenaireOMService: PartenaireOMService,
    private payementPartenaireOMService: PayementPartenaireOMService,
  ) { }

  allPartenaire: any[] = [];

  fetchPartenaire(): void {
    this.partenaireOMService.getAllPartenaireOM().subscribe({
      next: (response) => {
        this.allPartenaire = response;
        console.log(this.allPartenaire);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des partenaires:', error);
      },
    });
  }

  ngOnInit(): void {
    this.dtoptions = {
      paging: true, // Activer la pagination
      pagingType: 'full_numbers', // Type de pagination
      pageLength: 10, // Nombre d'éléments par page
    };
    this.fetchPartenaire();
    this.partenaireFormIntial();
    this.getAllPayementPartenaire();
    this.getUserInfo(); // Récupération des infos utilisateur
  }

  private partenaireFormIntial(): void {
    // Initialisation du formulaire avec les validations
    this.partenaireForm = this.fb.group({
      utilisateurId: [this.idUser],
      partenaireOMId: ['', Validators.required],
      type: ['', Validators.required],
      montant_depot: [0, [Validators.required, Validators.min(0)]],
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

  getAllPayementPartenaire() {
    // Appel à l'API et gestion des réponses
    this.payementPartenaireOMService.getAllPayementPartenaireOM().subscribe({
      next: (response) => {
        this.allresultat = response;
        console.log(this.allresultat);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données', error.message);
      },
    });
  }
  isLoading: boolean = false;

  montant_depot: number = 0;

  onInputChange(event: any): void {
    this.montant_depot = event.target.value.replace(/[^0-9,]/g, '');
  }

  onSubmit() {
    if (this.partenaireForm.valid) {
      const formData = this.partenaireForm.value;
      const montant_depot = parseInt(formData.montant_depot.replace(/,/g, ''), 10);
      console.log(formData);
      this.isLoading = true;
      this.payementPartenaireOMService
        .ajouterPayementPartenaireOM({ ...formData, montant_depot })
        .subscribe(
          (response) => {
            this.isLoading = false;
            // console.log('Partenaire ajouté avec succès:', response);
            this.partenaireForm.patchValue({
              partenaireOMId: '',
              type: '',
              montant_depot: '',
            });
            this.getAllPayementPartenaire();
            alert('Partenaire ajouté avec succès!');
          },
          (error) => {
            this.isLoading = false;
            // console.error("Erreur lors de l'ajout du partenaire:", error.message);
            alert(error.error.message);
          }
        );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}