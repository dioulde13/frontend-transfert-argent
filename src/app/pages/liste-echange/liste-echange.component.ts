import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { EchangeService } from '../../services/echanges/echange.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { DeviseService } from '../../services/devise/devise.service';
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';
import { CurrencyFormatPipe } from '../dasboard/currency-format.pipe';

interface Result {
  code: string;
  date_creation: string;
  nom: string;
  montant_cfa: number;
  signe_2: string;
  prix_2: number;
  prix_1: number;
  montant_gnf: number;
  montant_devise: number;
  montant_payer: number;
  montant_restant: number;
  payement_type: string;
  id: number;
}

@Component({
  selector: 'app-liste-echange',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DataTablesModule,
    CurrencyFormatPipe,
  ],
  templateUrl: './liste-echange.component.html',
  styleUrl: './liste-echange.component.css',
})
export class ListeEchangeComponent implements OnInit, AfterViewInit, OnDestroy {
  // Informations de l'utilisateur connecté
  userInfo: any = null;
  idUser: string = '';

  // Tableau pour stocker les résultats des entrées
  allresultat: Result[] = [];

  // Formulaire pour ajouter une entrée
  echangeForm!: FormGroup;

  partenaireForm!: FormGroup;

  private dataTable: any;

  editDeviseForm!: FormGroup;

  startDate: Date | null = null;
  endDate: Date | null = null;

  totalMontant: number = 0; // Initialisation

  filtrerEntreDates(): void {
    const startDateInput = (
      document.getElementById('startDate') as HTMLInputElement
    ).value;
    const endDateInput = (
      document.getElementById('endDate') as HTMLInputElement
    ).value;

    this.startDate = startDateInput ? new Date(startDateInput) : null;
    this.endDate = endDateInput ? new Date(endDateInput) : null;

    // Réinitialiser le total
    this.totalMontant = 0;

    // Filtrer d'abord par date
    let filteredResults = this.allresultat.filter(
      (result: { date_creation: string }) => {
        const resultDate = new Date(result.date_creation);
        return (
          (!this.startDate || resultDate >= this.startDate) &&
          (!this.endDate || resultDate <= this.endDate)
        );
      }
    );

    // Mettre à jour DataTable avec les résultats filtrés par date
    this.dataTable.clear().rows.add(filteredResults).draw();

    // Attendre que DataTable applique son propre filtre (search)
    setTimeout(() => {
      const filteredDataTable: { montant_gnf: number }[] = this.dataTable
        .rows({ search: 'applied' })
        .data()
        .toArray();

      // Recalculer le total avec des types explicitement définis
      this.totalMontant = filteredDataTable.reduce(
        (sum: number, row: { montant_gnf: number }) => {
          return sum + row.montant_gnf;
        },
        0
      );

      console.log(
        'Total Montant après filtre et recherche :',
        this.totalMontant
      );
    }, 200); // Timeout pour attendre la mise à jour de DataTable
  }
  selectedDevise: any = null; // Devise sélectionnée pour modification

  onEdit(devise: any) {
    this.selectedDevise = devise;
    this.editDeviseForm.patchValue({
      paysArriver: devise.paysArriver,
      signe_2: devise.signe_2,
      prix_1: devise.prix_1,
      prix_2: devise.prix_2,
    });
  }

  loadingModif: boolean = false;

  onUpdate() {
    this.loadingModif = true;
    if (this.editDeviseForm.valid && this.selectedDevise) {
      const updatedData = this.editDeviseForm.value;
      this.deviseService
        .modifierDevise(this.selectedDevise.id, updatedData)
        .subscribe(
          (response) => {
            this.loadingModif = false;
            this.fetchDevise();
            alert('Devise modifiée avec succès!');
          },
          (error) => {
            console.error('Erreur lors de la modification du devise:', error);
            alert('Erreur lors de la modification du devise.');
          }
        );
    }
  }

  private initDataTable(): void {
    setTimeout(() => {
      if (this.dataTable) {
        this.dataTable.destroy(); // Détruire l'ancienne instance avant d'en créer une nouvelle
      }
      this.dataTable = ($('#datatable') as any).DataTable({
        dom:
          "<'row'<'col-sm-6 dt-buttons-left'B><'col-sm-6 text-end dt-search-right'f>>" +
          "<'row'<'col-sm-12'tr>>" +
          "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        buttons: ['csv', 'excel', 'pdf', 'print'],
        paging: true,
        searching: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50],
        data: this.allresultat,
        order: [0, 'desc'],
        columns: [
          { title: 'Code', data: 'code' },
          {
            title: 'Date du jour',
            data: 'date_creation',
            render: (data: string) => {
              const date = new Date(data);
              const day = String(date.getDate()).padStart(2, '0'); // Jour
              const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois
              const year = date.getFullYear(); // Année
              const hours = String(date.getHours()).padStart(2, '0'); // Heures
              const minutes = String(date.getMinutes()).padStart(2, '0'); // Minutes

              return `${day}/${month}/${year} ${hours}:${minutes}`; // Format final
            },
          },
          { title: 'Nom', data: 'nom' },
          {
            title: 'Montant',
            data: 'montant_devise',
            render: (data: number, type: string, row: any) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data);

              const signe = row.signe_2;
              console.log(signe);

              return `${formattedAmount} ${signe}`;
            },
          },
          {
            title: 'Prix',
            data: 'prix_2',
            render: (data: number, type: string, row: any) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data);

              const signe = row.signe_1;
              console.log(signe);
              return `${formattedAmount} ${signe}`;
            },
          },
          {
            title: 'Montant en GNF',
            data: 'montant_gnf',
            render: (data: number, type: string, row: any) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data);
              console.log(row);

              const signe = row.signe_1;

              return `${formattedAmount} ${signe}`;
            },
          },
          {
            title: 'Montant payé (GNF)',
            data: 'montant_payer',
            render: (data: number, type: string, row: any) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data);

              const signe = row.signe_1;

              return `${formattedAmount} ${signe}`;
            },
          },
          {
            title: 'Montant restant (GNF)',
            data: 'montant_restant',
            render: (data: number, type: string, row: any) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data);

              const signe = row.signe_1;

              return `${formattedAmount} ${signe}`;
            },
          },
        ],
      });
      this.cd.detectChanges();
    }, 100);
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
    this.dtTrigger.unsubscribe();
  }

  isLoading: boolean = false;

  dtTrigger: Subject<any> = new Subject<any>();

  // Injection des dépendances nécessaires
  constructor(
    private echangeService: EchangeService,
    private authService: AuthService,
    private deviseService: DeviseService,
    private cd: ChangeDetectorRef,
    private partenaireService: PartenaireServiceService,
    private fb: FormBuilder
  ) {}

  // Initialisation du composant
  ngOnInit(): void {
    this.editDeviseForm = this.fb.group({
      paysArriver: ['', Validators.required],
      signe_2: ['', Validators.required],
      prix_1: ['', Validators.required],
      prix_2: ['', Validators.required],
    });
    this.initFormPartenaire();
    this.initForm(); // Initialisation du formulaire
    this.fetchAllEchange(); // Récupération des données existantes
    this.fetchDevise();
    this.getUserInfo(); // Récupération des infos utilisateur
    this.fetchPartenaire();
  }

  allPartenaire: any[] = [];

  // Récupération des devises
  fetchPartenaire(): void {
    this.partenaireService.getAllPartenaire().subscribe(
      (response) => {
        this.allPartenaire = response;
        console.log('Liste des partenaires:', this.allPartenaire);
      },
      (error) => {
        console.error('Erreur lors de la récupération des partenaires:', error);
      }
    );
  }

  getUserInfo() {
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        this.userInfo = response.user;
        //   if (this.userInfo) {
        this.idUser = this.userInfo.id;
        console.log('Informations utilisateur:', this.userInfo);

        // Mettre à jour le champ utilisateurId dans le formulaire
        this.echangeForm.patchValue({ utilisateurId: this.idUser });
        this.partenaireForm.patchValue({ utilisateurId: this.idUser });
      },
    });
  }

  montant_devise: number = 0;

  onInputChange(event: any): void {
    this.montant_devise = event.target.value.replace(/[^0-9,]/g, '');
  }

  // Méthode pour soumettre le formulaire et ajouter une nouvelle entrée
  ajouterEchange(): void {
    console.log(this.echangeForm.value);
    if (this.echangeForm.valid) {
      this.isLoading = true;
      const formData = this.echangeForm.value;
      const montant_devise = parseInt(
        formData.montant_devise.replace(/,/g, ''),
        10
      );
      this.echangeService
        .ajouterEchange({ ...formData, montant_devise })
        .subscribe({
          next: (response) => {
            console.log('Echange ajoutée avec succès:', response);
            this.fetchAllEchange();
            // Réinitialiser le formulaire et mettre à jour la liste
            this.echangeForm.patchValue({
              deviseId: '',
              nom: '',
              montant_devise: '',
            });
            this.isLoading = false;
            alert('Echange ajoutée avec succès !');
          },
          error: (error) => {
            this.isLoading = false;
            console.error("Erreur lors de l'ajout de l'echange:", error);
            alert("Erreur lors de l'ajout de l'echange.");
          },
        });
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

  // Initialisation du formulaire avec des validations
  private initForm(): void {
    this.echangeForm = this.fb.group({
      utilisateurId: [this.idUser], // Liaison utilisateurId
      deviseId: ['', Validators.required], // Initialisé à vide
      nom: ['', Validators.required],
      montant_devise: [0, Validators.required],
    });
  }

  private initFormPartenaire(): void {
    this.partenaireForm = this.fb.group({
      utilisateurId: [this.idUser],
      deviseId: ['', Validators.required],
      partenaireId: ['', Validators.required],
      montant: ['', Validators.required],
    });
  }

  montant: number = 0;

  onInputChangePartenaire(event: any): void {
    this.montant = event.target.value.replace(/[^0-9,]/g, '');
  }

  loadingPartenaire: boolean = false;

  onSoldeUpdate() {
    this.loadingPartenaire = true;
    if (this.partenaireForm.valid) {
      const updatedData = this.partenaireForm.value;

      const montant = parseInt(updatedData.montant.replace(/,/g, ''), 10);
      console.log(updatedData);
      this.echangeService
        .ajouterSoldePartenaire({ ...updatedData, montant })
        .subscribe({
          next: (response) => {
            this.partenaireForm.patchValue({
              deviseId: '',
              partenaireId: '',
              montant: '',
            });
            this.loadingPartenaire = false;
            alert(response.message);
          },
          error: (error) => {
            console.error('Erreur lors de la modification du echange:', error);
            alert('Erreur lors de la modification du echange.');
          },
        });
    }
  }

  allDevise: any[] = [];

  // Récupération des devises
  fetchDevise(): void {
    this.deviseService.getAllDevise().subscribe(
      (response) => {
        this.allDevise = response;
        console.log('Liste des devises:', this.allDevise);
      },
      (error) => {
        console.error('Erreur lors de la récupération des devises:', error);
      }
    );
  }

  private fetchAllEchange(): void {
    this.echangeService.getAllEchange().subscribe({
      next: (response) => {
        this.allresultat = response;
        this.initDataTable();
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données:', error);
      },
    });
  }
}
