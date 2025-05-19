import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { CreditService } from '../../services/credits/credit.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { CurrencyFormatPipe } from '../dasboard/currency-format.pipe';

interface Result {
  reference: string;
  date_creation: string;
  nom: string;
  montant: number;
  montantPaye: number;
  montantRestant: number;
  type: string;
  id: number;
}

@Component({
  selector: 'app-liste-credit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule,
    CurrencyFormatPipe,
  ], // Enlever BrowserModule
  templateUrl: './liste-credit.component.html',
  styleUrl: './liste-credit.component.css',
})
export class ListeCreditComponent implements OnInit {
  // Tableau pour stocker les résultats
  allresultat: Result[] = [];

  userInfo: any = null;
  idUser: string = '';

  private dataTable: any;

  creditForm!: FormGroup;

  startDate: Date | null = null;
  endDate: Date | null = null;

  totalMontantSortie: number = 0; // Initialisation
  totalMontantEntre: number = 0; // Initialisation

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
    this.totalMontantSortie = 0;

    // Réinitialiser le total
    this.totalMontantEntre = 0;

    // Filtrer d'abord par date
    let filteredResults = this.allresultat.filter(
      (result: { date_creation: string, type: string }) => {
        const resultDate = new Date(result.date_creation);
        return (
          result.type !== 'ANNULEE' &&
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

  
      this.totalMontantSortie = filteredDataTable.reduce(
        (sum: number, row: { type: string, montant: number }) => {
          if (row.type === "SORTIE") {
            return sum + row.montant;
          }
          return sum;
        },
        0
      );

      // Recalculer le total avec des types explicitement définis
      this.totalMontantEntre = filteredDataTable.reduce(
        (sum: number, row: { type: string, montant: number }) => {
          if (row.type === "ENTRE") {
            return sum + row.montant;
          }
          return sum;
        },
        0
      );


      // console.log(
      //   'Total Montant après filtre et recherche :',
      //   this.totalMontantSortie
      // );
    }, 200); // Timeout pour attendre la mise à jour de DataTable
  }

  dtTrigger: Subject<any> = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private creditService: CreditService,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initAnnulerCreditForm();

    this.creditForm = this.fb.group({
      // Champ pour l'identifiant de l'utilisateur (pré-rempli avec l'ID de l'utilisateur courant)
      utilisateurId: [this.idUser],

      // Champ pour le nom, obligatoire
      nom: ['', Validators.required],
      // Champ pour le montant, obligatoire et doit être un nombre positif ou zéro
      montant: [0, [Validators.required, Validators.min(0)]],

      type: ['', Validators.required],
    });

    this.getAllCredit();
    this.getUserInfo(); // Récupération des infos utilisateur
  }



  annulerCreditForm!: FormGroup;

  private initAnnulerCreditForm(): void {
    this.annulerCreditForm = this.fb.group({
      reference: ['', Validators.required],
    });
  }

  isLoadingAnnuler: boolean = false;

  annulerCredit(): void {
    this.isLoadingAnnuler = true;
    const { reference } =
      this.annulerCreditForm.value;
    this.creditService
      .annulerCreditParCode(reference)
      .subscribe({
        next: (response) => {
          console.log('Réponse du serveur:', response);
          this.isLoadingAnnuler = false;
          this.getAllCredit();
          this.annulerCreditForm.reset();
          alert(response.message);
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.isLoadingAnnuler = false;
          alert(error.error.message);
        },
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
        this.creditForm.patchValue({ utilisateurId: this.idUser });
      },
    });
  }

  getAllCredit() {
    // Appel à l'API et gestion des réponses
    this.creditService.getAllCredit().subscribe({
      next: (response) => {
        this.allresultat = response;
        this.initDataTable();
        this.cd.detectChanges();
        console.log(this.allresultat);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données', error);
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
        order: [0, 'desc'],
        columns: [
          { title: 'Reference', data: 'reference' },
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
            data: 'montant',
            render: (data: number) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data);
              return `${formattedAmount} GNF`;
            },
          },
          {
            title: 'Montant Payer',
            data: 'montantPaye',
            render: (data: number) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data);

              return `${formattedAmount} GNF`;
            },
          },
          {
            title: 'Montant Restant GNF',
            data: 'montantRestant',
            render: (data: number) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data);

              return `${formattedAmount} GNF`;
            },
          },
          {
            title: 'Type',
            data: 'type',
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

  loading: boolean = false;
  montant: number = 0;

  onInputChange(event: any): void {
    this.montant = event.target.value.replace(/[^0-9,]/g, '');
  }

  onSubmit() {
    if (this.creditForm.valid) {
      this.loading = true;
      const formData = this.creditForm.value;
      const montant = parseInt(formData.montant.replace(/,/g, ''), 10);

      console.log(formData);
      // Appeler le service pour ajouter le partenaire
      this.creditService.ajoutCredit({ ...formData, montant }).subscribe(
        (response) => {
          this.getAllCredit();
          console.log('Credit ajouté avec succès:', response);
          this.creditForm.patchValue({
            nom: '',
            montant: '',
            type: ''
          });
          this.loading = false;
          alert('Credit ajouté avec succès!');
        },
        (error) => {
          this.loading = false;
          alert(error.error.message);
        }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}
