import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SortieService } from '../../services/sortie/sortie.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { DeviseService } from '../../services/devise/devise.service';
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';
import { Subject } from 'rxjs';
import { CurrencyFormatPipe } from '../dasboard/currency-format.pipe';

interface Result {
  code: string;
  date_creation: string;
  nomCLient: string;
  pays_dest: string;
  pays_exp: string;
  codeEnvoyer: string;
  expediteur: string;
  receveur: string;
  telephone_receveur: string;
  montant_cfa: number;
  signe_2: string;
  signe_1: string;
  prix_2: number;
  montant: number;
  montantClient: number;
  montant_gnf: number;
  montant_payer: number;
  montant_restant: number;
  status: string;
  type_annuler?: string;
  id: number;
}

@Component({
  selector: 'app-liste-sortie',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyFormatPipe],
  templateUrl: './liste-sortie.component.html',
  styleUrl: './liste-sortie.component.css',
})
export class ListeSortieComponent implements OnInit, AfterViewInit, OnDestroy {
  // Tableau pour stocker les résultats des entrées
  allresultat: Result[] = [];

  userInfo: any = null;
  idUser: string = '';

  // Formulaire pour ajouter une entrée
  sortieForm!: FormGroup;
  annulerForm!: FormGroup;

  dtTrigger: Subject<any> = new Subject<any>();

  // Injection des dépendances nécessaires
  constructor(
    private sortieService: SortieService,
    private authService: AuthService,
    private deviseService: DeviseService,
    private partenaireService: PartenaireServiceService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  private dataTable: any;

  selectedDevise: any = null; // Devise sélectionnée pour modification

  isLoadingModifier: boolean = false;
  onUpdate() {
    this.isLoadingModifier = true;
    if (this.editDeviseForm.valid && this.selectedDevise) {
      const updatedData = this.editDeviseForm.value;
      this.deviseService
        .modifierDevise(this.selectedDevise.id, updatedData)
        .subscribe({
          next: (response) => {
            this.fetchDevise();
            alert('Devise modifiée avec succès!');
            this.isLoadingModifier = false;
          },
          error: (error) => {
            console.error('Erreur lors de la modification du devise:', error);
            alert('Erreur lors de la modification du devise.');
          },
        });
    }
  }

  editDeviseForm!: FormGroup;
  onEdit(devise: any) {
    this.selectedDevise = devise;
    this.editDeviseForm.patchValue({
      paysArriver: devise.paysArriver,
      signe_2: devise.signe_2,
      prix_1: devise.prix_1,
      prix_2: devise.prix_2,
    });
  }

  startDate: Date | null = null;
  endDate: Date | null = null;

  totalMontant: number = 0; // Initialisation
  totalMontantDevise: number = 0; // Initialisation

  filtrerSortieDates(): void {
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
    this.totalMontantDevise = 0;

    // Filtrer d'abord par date
    let filteredResults = this.allresultat.filter(
      (result: { date_creation: string , status: string }) => {
        const resultDate = new Date(result.date_creation);
        return (
          result.status !== 'ANNULEE' &&
          (!this.startDate || resultDate >= this.startDate) &&
          (!this.endDate || resultDate <= this.endDate)
        );
      }
    );

    // Mettre à jour DataTable avec les résultats filtrés par date
    this.dataTable.clear().rows.add(filteredResults).draw();

    // Attendre que DataTable applique son propre filtre (search)
    setTimeout(() => {
      const filteredDataTable = this.dataTable
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

       // Calculer le total montant en devise (CFA)
      this.totalMontantDevise = filteredDataTable.reduce(
        (sum: number, row: { montant: number }) => sum + (row.montant || 0),
        0
      );

      // console.log(
      //   'Total Montant après filtre et recherche :',
      //   this.totalMontant
      // );
    }, 200); // Timeout pour attendre la mise à jour de DataTable
  }

  // Méthode pour récupérer toutes les entrées via l'API
  private fetchAllSortie(): void {
    this.sortieService.getAllSortie().subscribe({
      next: (response) => {
        this.allresultat = response;
        console.log(this.allresultat);
        this.initDataTable();
        this.cd.detectChanges();
      },
      error: (error) => {
        // Gestion des erreurs lors de l'appel API
        console.error('Erreur lors de la récupération des données:', error);
      },
    });
  }

  selectedSortie: any = null;
  valideSortieForm!: FormGroup;
  validerSortieModal(sortie: any) {
    console.log('Sortie reçue :', sortie);
    this.selectedSortie = sortie;

    this.valideSortieForm.patchValue({
      utilisateurId: sortie?.Utilisateur?.id,
      partenaireId: sortie?.Partenaire?.id,
      prix_2: sortie?.prix_2,
    });

    // console.log('Formulaire :', this.valideSortieForm);
    // console.log('Sortie sélectionnée :', this.selectedSortie);
  }

  isLoadingValiderSortie: boolean = false;

  valideSortie() {
    this.isLoadingValiderSortie = true;
    const updatedData = this.valideSortieForm.value;
    if (!updatedData.code_sortie) {
      alert('Veuillez saisir un code de sortie !');
      return;
    }
    console.log('Code de sortie saisi :', updatedData.code_sortie); // Vérification
    this.sortieService
      .validerSortie(updatedData.code_sortie, updatedData) // Utilisation du code_sortie
      .subscribe({
        next: (response) => {
          this.fetchAllSortie();
          this.fetchPartenaire();
          alert(response.message);
          this.valideSortieForm.patchValue({
            partenaireId: '',
            code_sortie: '',
            prix_2: '',
          });
          this.isLoadingValiderSortie = false;
        },
        error: (error) => {
          this.isLoadingValiderSortie = false;
          alert(error.error.message);
        },
      });
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
        order: [[0, 'desc']],
        columns: [
          { title: 'Code generer', data: 'code' },
          { title: 'Code', data: 'codeEnvoyer' },
          { title: 'Client', data: 'nomCLient' },
          {
            title: 'Date du jour',
            data: 'date_creation',
            render: (data: string) => {
              const date = new Date(data);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              return `${day}/${month}/${year} ${hours}:${minutes}`;
            },
          },
          { title: 'Pays', data: 'pays_dest' },
          { title: 'Expéditeur', data: 'expediteur' },
          { title: 'Receveur', data: 'receveur' },
          { title: 'Téléphone', data: 'telephone_receveur' },
          {
            title: 'Montant',
            data: 'montant',
            render: (data: number, type: string, row: any) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data);
              return `${formattedAmount} ${row.signe_2}`;
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
              return `${formattedAmount} ${row.signe_1}`;
            },
          },
          {
            title: 'Montant en GNF',
            data: 'montant_gnf',
            render: (data: number, type: string, row: any) => {
              const montantGNF = row.montant_gnf;

              return row.montant_gnf === 0
                ? `${new Intl.NumberFormat('fr-FR').format(row.montantClient)} 
                GNF`
                : `${new Intl.NumberFormat('fr-FR').format(montantGNF)} 
               GNF`;
            },
          },
          // {
          //   title: 'Montant en GNF',
          //   data: 'montant_gnf',
          //   render: (data: number, type: string, row: any) => {
          //     const formattedAmount = new Intl.NumberFormat('fr-FR', {
          //       style: 'decimal',
          //       minimumFractionDigits: 0,
          //       maximumFractionDigits: 0,
          //     }).format(data);
          //     return `${formattedAmount} ${row.signe_1}`;
          //   },
          // },
          {
            title: 'Montant payé GNF',
            data: 'montant_payer',
            render: (data: number, type: string, row: any) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data);
              return `${formattedAmount} ${row.signe_1}`;
            },
          },
          {
            title: 'Montant restant GNF',
            data: 'montant_restant',
            render: (data: number, type: string, row: any) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data);
              return `${formattedAmount} ${row.signe_1}`;
            },
          },
          {
            title: 'Status',
            data: 'status',
            render: (data: string, type: string, row: any) => {
              console.log(row); 
              if (row.montant === 0){
                return `${row.status} (${row.type_annuler})`;
              } else if(row.montant > 0 && row.type ==="R"){
                return `${row.status} (${row.type})`;
              }
              return data + (data === `ANNULEE` ? `(${row.type})` : ``);
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

  private initValiderSortie() {
    this.valideSortieForm = this.fb.group({
      utilisateurId: [this.idUser],
      partenaireId: [''],
      code_sortie: ['', Validators.required],
      prix_2: ['', Validators.required],
    });
  }
  // Initialisation du composant
  ngOnInit(): void {
    this.editDeviseForm = this.fb.group({
      paysArriver: ['', Validators.required],
      signe_2: ['', Validators.required],
      prix_1: ['', Validators.required],
      prix_2: ['', Validators.required],
    });
    // Initialisation du formulaire
    this.initForm();
    // Récupération des données existantes via l'API
    this.getUserInfo(); // Récupération des infos utilisateur
    this.fetchAllSortie(); // Récupération des données existantes
    this.fetchDevise();
    this.fetchPartenaire();
    this.annulerFormInitial();
    this.initValiderSortie();
    this.initFormAutres();
  }

  sortieFormAutre!: FormGroup;

  private initFormAutres(): void {
    this.sortieFormAutre = this.fb.group({
      utilisateurId: [this.idUser],
      nomCLient: ['', Validators.required],
      montantClient: [0, Validators.required],
    });
  }

  montantClient: number = 0;

  onInputChangeMontantClient(event: any): void {
    this.montantClient = event.target.value.replace(/[^0-9,]/g, '');
  }

  isloadingEntreAutre: boolean = false;

  ajouterSortieAutres(): void {
    this.isloadingEntreAutre = true;

    const formData = this.sortieFormAutre.value;
    // console.log(formData);

    const montantClient = parseInt(
      formData.montantClient.replace(/,/g, ''),
      10
    );

    this.sortieService
      .ajouterSortieAutres({ ...formData, montantClient })
      .subscribe({
        next: (response) => {
          console.log('Sortie ajoutée avec succès:', response);
          this.fetchAllSortie();
          this.sortieFormAutre.patchValue({
            nomCLient: '',
            montantClient: '',
          });
          this.isloadingEntreAutre = false;
          alert('Sortie ajoutée avec succès !');
        },
        error: (error) => {
          this.isloadingEntreAutre = false;
          console.error(error.error.message);
          alert(error.error.message);
        },
      });
  }

  private annulerFormInitial(): void {
    this.annulerForm = this.fb.group({
      codeAnnuler: ['', Validators.required],
    });
  }

  isLoadingAnnuler: boolean = false;

  annulerSortie(): void {
    this.isLoadingAnnuler = true;
    const { codeAnnuler } = this.annulerForm.value;
    this.sortieService.annulerSortie(codeAnnuler).subscribe({
      next: (response) => {
        this.isLoadingAnnuler = false;
        alert(response.message);
        this.fetchPartenaire();
        this.fetchAllSortie();
      },
      error: (error) => {
        this.isLoadingAnnuler = false;
        alert(error.error.message);
      },
    });
  }

  allPartenaire: any[] = [];

  fetchPartenaire(): void {
    this.partenaireService.getAllPartenaire().subscribe({
      next: (response: any[]) => {
        this.allPartenaire = response.filter(
          (partenaire: any) => partenaire.pays === 'Guinée-Bissau'
        );
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des partenaires:', error);
      },
    });
  }

  allDevise: any[] = [];

  // Récupération des devises
  fetchDevise(): void {
    this.deviseService.getAllDevise().subscribe({
      next: (response: any[]) => {
        this.allDevise = response.filter(
          (devise: any) => devise.paysArriver === 'Guinée-Bissau'
        );
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des devises:', error);
      },
    });
  }

  getUserInfo() {
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        this.userInfo = response.user;
        this.idUser = this.userInfo.id;
        console.log('Informations utilisateur:', this.userInfo);
        this.sortieForm.patchValue({ utilisateurId: this.idUser });
        this.sortieFormAutre.patchValue({ utilisateurId: this.idUser });
        this.valideSortieForm.patchValue({ utilisateurId: this.idUser });
      },
    });
  }

  // Initialiser le formulaire avec des validations
  private initForm() {
    this.sortieForm = this.fb.group({
      utilisateurId: [this.idUser],
      partenaireId: ['', Validators.required],
      deviseId: ['', Validators.required],
      expediteur: ['', Validators.required],
      codeEnvoyer: ['', Validators.required],
      receveur: ['', Validators.required],
      montant: [0, Validators.required],
      telephone_receveur: ['', Validators.required],
    });
  }

  montant: number = 0;

  onInputChange(event: any): void {
    this.montant = event.target.value.replace(/[^0-9,]/g, '');
  }

  loading: boolean = false;

  // Méthode pour soumettre le formulaire et ajouter une nouvelle entrée
  ajouterSortie(): void {
    console.log(this.sortieForm.value);
    if (this.sortieForm.valid) {
      this.loading = true;
      const formData = this.sortieForm.value; // Récupérer les valeurs du formulaire

      const montant = parseInt(formData.montant.replace(/,/g, ''), 10);

      this.sortieService.ajouterSortie({ ...formData, montant }).subscribe({
        next: (response) => {
          console.log('Sortie ajoutée avec succès:', response);
          this.fetchAllSortie();
          // Réinitialiser le formulaire et mettre à jour la liste
          this.sortieForm.patchValue({
            partenaireId: '',
            deviseId: '',
            expediteur: '',
            codeEnvoyer: '',
            receveur: '',
            montant: '',
            telephone_receveur: '',
          });
          this.loading = false;
          alert(response.message);
        },
        error: (error) => {
          alert(error.error.message);
          this.loading = false;
        },
      });
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}
