import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common'; // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { AuthService } from '../../services/auth/auth-service.service';
import { PayementCreditService } from '../../services/payementCredit/payement-credit.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { CurrencyFormatPipe } from '../dasboard/currency-format.pipe';

interface Result {
  reference: string;
  date_creation: string;
  montant: number;
  id: number;
}

@Component({
  selector: 'app-payement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule,
    CurrencyFormatPipe,
  ], // Enlever BrowserModule
  templateUrl: './payement.component.html',
  styleUrl: './payement.component.css',
})
export class PayementComponent implements OnInit, AfterViewInit {
  // Tableau pour stocker les résultats
  allresultat: Result[] = [];

  userInfo: any = null;
  idUser: string = '';

  payementCreditForm!: FormGroup;

  dtTrigger: Subject<any> = new Subject<any>();

  private dataTable: any;

  filteredResults: any[] = [];

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
      const filteredDataTable: { montant: number }[] = this.dataTable
        .rows({ search: 'applied' })
        .data()
        .toArray();

      // Recalculer le total avec des types explicitement définis
      this.totalMontant = filteredDataTable.reduce(
        (sum: number, row: { montant: number }) => {
          return sum + row.montant;
        },
        0
      );

      console.log(
        'Total Montant après filtre et recherche :',
        this.totalMontant
      );
    }, 200); // Timeout pour attendre la mise à jour de DataTable
  }

  constructor(
    private fb: FormBuilder,
    private payementCreditService: PayementCreditService,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire avec les validations
    this.payementCreditForm = this.fb.group({
      utilisateurId: [this.idUser],
      reference: ['', Validators.required],
      date_creation: ['', Validators.required],
      montant: ['', Validators.required],
    });
    this.getAllPayementCredit();
    this.getUserInfo(); // Récupération des infos utilisateur
  }

  getAllPayementCredit() {
    this.payementCreditService.getAllPayementCredit().subscribe({
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
        this.dataTable.destroy();
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
          {
            title: 'Date paiement',
            data: 'date_creation',
            render: (data: string, type: any, row: any) => {
              if (!data || !row.Credit) return '';
              const date = new Date(data);
              const formattedDate = date.toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              return ` ${row.reference} / ${formattedDate} / ${row.Credit.nom}`;
            },
          },
          {
            title: 'Montant',
            data: 'montant',
            render: (data: number) => {
              return (
                new Intl.NumberFormat('fr-FR', {
                  style: 'decimal',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(data) + ' GNF'
              );
            },
          },
        ],
      });
      this.cd.detectChanges(); // Force la détection des changements
    }, 100);
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  getUserInfo() {
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        this.userInfo = response.user;
        //   if (this.userInfo) {
        this.idUser = this.userInfo.id;
        console.log('Informations utilisateur:', this.userInfo);

        // Mettre à jour le champ utilisateurId dans le formulaire
        this.payementCreditForm.patchValue({ utilisateurId: this.idUser });
      },
    });
  }

  loading: boolean = false;

  montant: number = 0;

  onInputChange(event: any): void {
    this.montant = event.target.value.replace(/[^0-9,]/g, '');
  }
  onSubmit() {
    if (this.payementCreditForm.valid) {
      const formData = this.payementCreditForm.value;
      const montant = parseInt(formData.montant.replace(/,/g, ''), 10);
      this.loading = true;
      this.payementCreditService
        .ajouterPayementCredit({ ...formData, montant })
        .subscribe(
          (response) => {
            console.log('Payement ajouté avec succès:', response);
            alert('Payement ajouté avec succès!');
            this.payementCreditForm.patchValue({
              reference: '',
              montant: '',
            });
            this.getAllPayementCredit();
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            // Vérifie si l'erreur contient un message spécifique
            const errorMessage =
              error.error?.message ||
              "Une erreur est survenue lors de l'ajout du résultat.";
            alert(errorMessage);
          }
          // error => {
          //   console.error('Erreur lors de l\'ajout du payement:', error);
          //   alert('Erreur lors de l\'ajout du payement.');
          // }
        );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}
