import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { OrangeMoneyService } from '../../services/orangeMoney/orange-money.service';

@Component({
  selector: 'app-orange-money',
  imports: [
     CommonModule,
    ReactiveFormsModule,
    DataTablesModule,
  ],
  templateUrl: './orange-money.component.html',
  styleUrl: './orange-money.component.css'
})
export class OrangeMoneyComponent implements OnInit {
  // Tableau pour stocker les résultats
  allresultat: any[] = [];

  userInfo: any = null;
  idUser: string = '';

  orangeMoneyForm!: FormGroup;

  dtoptions: any = {};


  dtTrigger: Subject<any> = new Subject<any>();

  selectPaye: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private orangeMoneyServices: OrangeMoneyService,
  ) { }

  

  ngOnInit(): void {
    this.dtoptions = {
      paging: true, // Activer la pagination
      pagingType: 'full_numbers', // Type de pagination
      pageLength: 10, // Nombre d'éléments par page
    };
    this.orangeMoneyFormIntial();
    this.getAllOrangeMoney();
    this.getUserInfo(); 
    this.initValiderOrange();
  }

  valideOrangeForm!: FormGroup;


   private initValiderOrange() {
    this.valideOrangeForm = this.fb.group({
      utilisateurId: [this.idUser],
      reference: ['', Validators.required],
    });
  }

  isLoadingValiderSortie: boolean = false;

  valideSortie() {
    this.isLoadingValiderSortie = true;
    const updatedData = this.valideOrangeForm.value;
    if (!updatedData.reference) {
      alert('Veuillez saisir un reference !');
      return;
    }
    console.log('reference de sortie saisi :', updatedData); // Vérification
    this.orangeMoneyServices
      .validerOrangeMOney(updatedData.reference, updatedData) // Utilisation du reference_sortie
      .subscribe({
        next: (response) => {
          this.getAllOrangeMoney();
          alert(response.message);
          this.valideOrangeForm.patchValue({
            reference: '',
          });
          this.isLoadingValiderSortie = false;
        },
        error: (error) => {
          this.isLoadingValiderSortie = false;
          alert(error.error.message);
        },
      });
  }

  private orangeMoneyFormIntial(): void {
    this.orangeMoneyForm = this.fb.group({
      utilisateurId: [this.idUser],
      type: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]],
    });
  }


  getUserInfo() {
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        this.userInfo = response.user;
        this.idUser = this.userInfo.id;
        this.initValiderOrange();
        console.log('Informations utilisateur:', this.userInfo);

        this.orangeMoneyForm.patchValue({ utilisateurId: this.idUser });
      },
    });
  }

  getAllOrangeMoney() {
    this.orangeMoneyServices.getAllOrangeMoney().subscribe({
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

  montant: number = 0;

  onInputChange(event: any): void {
    this.montant = event.target.value.replace(/[^0-9,]/g, '');
  }

  onSubmit() {
    if (this.orangeMoneyForm.valid) {
      const formData = this.orangeMoneyForm.value;
      console.log(formData);
      this.isLoading = true;
      this.orangeMoneyServices
        .ajouterOrangeMoney(formData)
        .subscribe(
          (response) => {
            this.isLoading = false;
            console.log('Ajouté avec succès:', response);
            this.orangeMoneyForm.patchValue({
              type: '',
              montant: '',
            });
            this.getAllOrangeMoney();
            alert('Ajouté avec succès!');
          },
          (error) => {
            this.isLoading = false;
            console.error("Erreur lors de l'ajout du partenaire:", error.error.message);
            alert(error.error.message);
          }
        );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}