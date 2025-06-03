import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { PayementService } from '../../services/payements/payement.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { CurrencyFormatPipe } from '../dasboard/currency-format.pipe';

interface Result {
  code: string;
  date_creation: string;
  montant: number;
  type: string;
  id: number;
}

@Component({
  selector: 'app-payements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyFormatPipe],
  templateUrl: './payements.component.html',
  styleUrl: './payements.component.css',
})
export class PayementsComponent implements OnInit, AfterViewInit {
  allresultat: Result[] = [];
  private dataTable: any;

  userInfo: any = null;
  idUser: string = '';
  payementForm!: FormGroup;

  // dtoptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private payementService: PayementService,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initFormCaisse();
    this.payementForm = this.fb.group({
      utilisateurId: [this.idUser],
      code: ['', Validators.required],
      montant: ['', Validators.required],
      type: ['', Validators.required],
      prix: [''],
      signe: [''],
    });
    this.filteredResults = [...this.allresultat];
    this.getUserInfo();
    this.getAllPayement();
  }

  conversionDeviseForm!: FormGroup;


  private initFormCaisse(): void {
    this.conversionDeviseForm = this.fb.group({
      montantDevise: ['', Validators.required],
      prixDevise: ['', Validators.required],
      signe1: ['', Validators.required],
      signe2: ['', Validators.required],
    });
  }


  soldeTotal: number = 0;
  montantDevise: number = 0;
  prixDevise: number = 0;
  signe2: string = '';

  onInputChangeMontantDevise(event: any): void {
    this.montantDevise = event.target.value.replace(/[^0-9,]/g, '');
  }
  onInputChangePrixDevise(event: any): void {
    this.prixDevise = event.target.value.replace(/[^0-9,]/g, '');
  }

  conversionDevise(): void {
    const formData = this.conversionDeviseForm.value;

    const montant = parseFloat(formData.montantDevise.toString().replace(/,/g, ''));
    const prix = parseFloat(formData.prixDevise.toString().replace(/,/g, ''));
    const signe1 = formData.signe1;
    const signe2 = formData.signe2;

    if (!montant || !prix || !signe1 || !signe2) {
      this.soldeTotal = 0;
      return;
    }

    if (signe1 === "EURO" && signe2 === "GNF") {
      this.soldeTotal = montant * prix / 100;
    } else if (signe1 === "USD" && signe2 === "GNF") {
      this.soldeTotal = montant * prix / 100;
    } else if (signe1 === "XOF" && signe2 === "GNF") {
      this.soldeTotal = montant * prix / 5000;
    } else if (signe1 === "GNF" && signe2 === "XOF") {
      this.soldeTotal = montant / prix * 5000;
    } else if (signe1 === "GNF" && signe2 === "EURO") {
      this.soldeTotal = montant / prix * 100;
    } else if (signe1 === "GNF" && signe2 === "USD") {
      this.soldeTotal = montant / prix * 100;
    } else {
      this.soldeTotal = 0;
    }
  }

  showUserModal: boolean = false;

  openUserModal() {
    this.showUserModal = true;
  }

  closeUserModal() {
    this.showUserModal = false;
  }

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

  getAllPayement() {
    this.payementService.getAllPayement().subscribe({
      next: (response) => {
        this.allresultat = response;
        console.log(this.allresultat);
        this.initDataTable();
        this.cd.detectChanges();
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
              const date = new Date(row.date_creation);
              const formattedDate = date.toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              return `${row.entreId === null ? row.Sortie.pays_exp : row.Entre.pays_dest
                } / ${row.entreId === null ? row.Sortie.code : row.Entre.code
                } / ${row.entreId === null
                  ? row.Sortie.expediteur
                  : row.Entre.expediteur
                } / ${formattedDate}`;
            },
          },
          {
            title: 'Montant',
            data: 'montant',
            render: (data: number, type: any, row: any) => {
              const prix = (row.prix);
              const formatted = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data);

              const formattedPrix = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(prix);

              const devise = row.signe === "EURO" ? "€" :
                row.signe === "USD" ? "$" :
                  row.signe === "XOF" ? "XOF" : "GNF";

              if (row.signe === "XOF") {
                const montantTotal = Number(prix / 5000) * Number(data);
                  return Number(prix) === 0
                ? `${formatted} ${devise}`
                : `${formatted} ${devise} -> ${formattedPrix} GNF = ${montantTotal.toLocaleString('fr-FR')} GNF`;
              } else {
                const montantTotal = Number(prix / 100) * Number(data);
                  return Number(prix) === 0
                ? `${formatted} ${devise}`
                : `${formatted} ${devise} -> ${formattedPrix} GNF = ${montantTotal.toLocaleString('fr-FR')} GNF`;
              }
            },
          }
          ,
          {
            title: 'Type',
            data: 'type',
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
        this.idUser = this.userInfo.id;
        this.payementForm.patchValue({ utilisateurId: this.idUser });
      },
    });
  }

  montant: number = 0;

  onInputChange(event: any): void {
    this.montant = event.target.value.replace(/[^0-9,]/g, '');
  }

  prix: number = 0;

  onInputChangePrix(event: any): void {
    this.prix = event.target.value.replace(/[^0-9,]/g, '');
  }

  onSubmit() {
    if (this.payementForm.valid) {
      const formData = this.payementForm.value;
      console.log(formData);
      this.loading = true;

      const montant = parseInt(formData.montant.replace(/,/g, ''), 10);

      const prix = parseInt(formData.prix.replace(/,/g, ''), 10);


      this.payementService.ajouterPayement({ ...formData, montant, prix }).subscribe(
        (response) => {
          this.loading = false;
          this.payementForm.patchValue({
            code: '',
            montant: '',
            type: '',
            prix: '',
            signe: ''
          });
          this.getAllPayement();
          alert(response.message);
        },
        (error) => {
          this.loading = false;
          const errorMessage =
            error.error?.message || "Erreur lors de l'ajout du paiement.";
          alert(errorMessage);
        }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe(); // Nettoyage
  }

}

// // Détruire l'ancienne instance de DataTable si elle existe
// if ($.fn.DataTable.isDataTable('#transactions-table')) {
//   $('#transactions-table').DataTable().clear().destroy();
// }

// // Initialiser DataTable après un court délai
// setTimeout(() => {
//   let table = $('#transactions-table').DataTable(this.dtoptions);

//   const calculateTotal = () => {
//     let total = 0;
//     let visibleRows = table.rows(':visible').data().length; // Nombre de lignes visibles

//     if (visibleRows > 0) {
//       table.rows(':visible').every(function () {
//         let rowData = this.data();
//         let montant = parseFloat(
//           rowData[1].toString().replace(/\s/g, '').replace(/,/g, '')
//         ) || 0;

//         total += montant;
//       });
//     }

//     // Afficher le total uniquement si un filtre est actif
//     if (visibleRows > 0 && (startDateObj || endDateObj)) {
//       $('#totalMontant').html(
//         `<strong>Total Montant GNF :</strong> ${total.toLocaleString()} GNF`
//       );
//     } else {
//       $('#totalMontant').html(`<strong>Total Montant GNF :</strong> 0 GNF`);
//     }
//   };

//   let startDateObj: Date | null = null;
//   let endDateObj: Date | null = null;

//   // Fonction de filtrage des dates
//   $('#btnFilter').on('click', function () {
//     let startDate = ($('#startDate').val() as string);
//     let endDate = ($('#endDate').val() as string);

//     startDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
//     endDateObj = endDate ? new Date(endDate + 'T23:59:59') : null;

//     table.rows().every(function () {
//       let rowData = this.data();
//       console.log(rowData);

//       // Extraction de la chaîne de date depuis la première colonne
//       let dateStr = rowData[0];
//       console.log(dateStr);

//       if (dateStr) {
//         // Séparer la chaîne par " / " pour obtenir chaque partie
//         let parts = dateStr.split(' / ');

//         // La date et l'heure sont dans la dernière partie après le dernier "/"
//         let lastPart = parts[parts.length - 1];

//         // Extraire la date et l'heure séparément
//         let [dateOnly, timePart] = lastPart.split(' '); // dateOnly = "02/02/2025", timePart = "16:05"
//         console.log(dateOnly);

//         if (dateOnly && timePart) {
//           // Conversion de la date et de l'heure en objets numériques
//           let [day, month, year] = dateOnly.split('/').map(Number);
//           let [hours, minutes] = timePart.split(':').map(Number);

//           // Création de l'objet Date
//           let rowDate = new Date(year, month - 1, day, hours, minutes);
//           console.log(rowDate);

//           // Vérification si la date est comprise entre startDateObj et endDateObj
//           if (
//             (!startDateObj || rowDate >= startDateObj) &&
//             (!endDateObj || rowDate <= endDateObj)
//           ) {
//             $(this.node()).show(); // Affiche la ligne si la condition est respectée
//           } else {
//             $(this.node()).hide(); // Cache la ligne sinon
//           }
//         }
//       }
//     });

//     table.draw();
//     calculateTotal();
//   });

//   // Mettre à jour le total lors de la recherche
//   table.on('search.dt', function () {
//     calculateTotal();
//   });

//   // Afficher 0 par défaut
//   $('#totalMontant').html(`<strong>Total Montant GNF :</strong> 0 GNF`);
// }, 100);

// this.dtoptions = {
//   pagingType: 'full_numbers',
//   pageLength: 10,
//   processing: true,
//   order: [0,'desc'],
//   dom: "<'row'<'col-sm-6 dt-buttons-left'B><'col-sm-6 text-end dt-search-right'f>>" +
//        "<'row'<'col-sm-12'tr>>" +
//        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
//   buttons: ['csv', 'excel', 'print'],
//   language: {
//       search: "Rechercher"
//   }
// };
