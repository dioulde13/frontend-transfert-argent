import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service.service';
import { CommonModule } from '@angular/common';
import { EntreServiceService } from '../../services/entre/entre-service.service';
import { SortieService } from '../../services/sortie/sortie.service';
import { EchangeService } from '../../services/echanges/echange.service';
import { RembourserService } from '../../services/rembourser/rembourser.service';
import { PayementEchangeService } from '../../services/payementEchange/payement.service';
import { PayementService } from '../../services/payements/payement.service';
import { DepenseService } from '../../services/depenses/depense.service';
import { FinanceService } from '../../services/benefices/finance.service';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VerifierSoldeService } from '../../services/soldeVerifier/verifier-solde.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { CurrencyFormatPipe } from './currency-format.pipe'; // Assurez-vous que le chemin est correct
import { CalculBeneficeService } from '../../services/calculBenefices/calcul-benefice.service';




interface Result {
  date_creation: string,
  solde_dollars: number,
  solde_euro: number;
  solde_cfa: number;
  solde_gnf: number;
  prix_cfa: number;
  prix_euro: number;
  prix_dollar: number;
}



@Component({
  selector: 'app-dasboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTablesModule, CurrencyFormatPipe],
  templateUrl: './dasboard.component.html',
  styleUrl: './dasboard.component.css'
})
export class DasboardComponent implements OnInit, AfterViewInit, OnDestroy {

  dateDebut: string = '';
  dateFin: string = '';
  resultat: any;
  erreur: string = '';
  verifierCaisse!: FormGroup;
  formRecharger!: FormGroup;

  dtTrigger: Subject<any> = new Subject<any>();
  private dataTable: any;


  private initDataTable(): void {
    setTimeout(() => {
      this.dataTable = ($('#datatable') as any).DataTable({
        dom: "<'row'<'col-sm-6 dt-buttons-left'B><'col-sm-6 text-end dt-search-right'f>>" +
          "<'row'<'col-sm-12'tr>>" +
          "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        buttons: ['csv', 'excel', 'pdf', 'print'],
        paging: true,
        searching: true,
        pageLength: 5,
        lengthMenu: [5, 10, 50],
        destroy: true,
        data: this.allSoldeCaisse,
        order: [[0, 'desc']],
        columns: [
          {
            title: "Date du jour",
            data: "date_creation",
            render: (data: string) => {
              const date = new Date(data);
              return date.toLocaleDateString('fr-FR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              });
            }
          },
          {
            title: "Solde euro en GNF",
            data: "solde_euro",
            render: (data: number, type: any, row: any) => {
              return new Intl.NumberFormat('fr-FR').format((data / 100) * row.prix_euro);
            }
          },
          {
            title: "Solde dollars en GNF",
            data: "solde_dollars",
            render: (data: number, type: any, row: any) => {
              return new Intl.NumberFormat('fr-FR').format((data / 100) * row.prix_dollar);
            }
          },
          {
            title: "Solde cfa en GNF",
            data: "solde_cfa",
            render: (data: number, type: any, row: any) => {
              return new Intl.NumberFormat('fr-FR').format((data / 5000) * row.prix_cfa);
            }
          },
          {
            title: "Solde en GNF",
            data: "solde_gnf",
            render: (data: number) => {
              return new Intl.NumberFormat('fr-FR').format(data);
            }
          },
          {
            title: "Total",
            data: null,
            render: (data: any, type: any, row: any) => {
              const total = row.solde_gnf + ((row.solde_cfa / 5000) * row.prix_cfa) + ((row.solde_dollars / 100) * row.prix_dollar) + ((row.solde_euro / 100) * row.prix_euro);
              return new Intl.NumberFormat('fr-FR').format(total);
            }
          }
        ]
      });

      setTimeout(() => {
        this.cd.detectChanges();
      }, 200);
    }, 100);
  }


  allSoldeCaisse: Result[] = [];

  allSoldeCaisseParJours: any;

  getAllSoldeCaisseParJours(): void {
    this.verifierCaisseService.getAllVerifierCaisseParJours().subscribe({
      next: (response) => {
        this.allSoldeCaisseParJours = response;
        console.log(this.allSoldeCaisseParJours);
        // alert(response.message);
      },
      // error: (error) => {
      //   alert(error.error.message);
      // }
    });
  }


  getAllVerifierCaise(): void {
    this.verifierCaisseService.getAllVerifierCaisse().subscribe({
      next: (response) => {
        if (this.dataTable) {
          this.dataTable.destroy();
        }
        this.allSoldeCaisse = response;
        this.initDataTable();
        this.cd.detectChanges();
        console.log(this.allSoldeCaisse);
      }
    });
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



  constructor(
    private authService: AuthService,
    private entreService: EntreServiceService,
    private sortieSortie: SortieService,
    private echangeService: EchangeService,
    private payementEchange: PayementEchangeService,
    private rembourserService: RembourserService,
    private payementService: PayementService,
    private depenseService: DepenseService,
    private financeService: FinanceService,
    private verifierCaisseService: VerifierSoldeService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private beneficeService: CalculBeneficeService
  ) { }


  ngOnInit(): void {
    this.getUserInfo();
    this.getCompteEntre();
    this.getCompteSortie();
    this.getComptePayement();
    this.getCompteEchange();
    this.getComptePayementEchange();
    this.getCompteDuJour();
    this.getSommeMontantDepense();
    this.initFormCaisse();
    this.initFormRecharger();
    this.getAllVerifierCaise();
    this.getAllSoldeCaisseParJours();
  }




  dateDebutBenefice = '';
  dateFinBenefice = '';
  resultatBefice: any = null;
  erreurBenefice: string = '';


  calculBenefice() {
    if (!this.dateDebutBenefice || !this.dateFinBenefice) {
      this.erreurBenefice = 'Veuillez sélectionner les deux dates.';
      return;
    }

    this.beneficeService.getBenefice(this.dateDebutBenefice, this.dateFinBenefice).subscribe({
      next: (res) => {
        this.resultatBefice = res;
        this.erreurBenefice = '';
      },
      error: (err) => {
        this.erreurBenefice = err.error.message || 'Erreur lors du calcul du bénéfice.';
        this.resultatBefice = null;
      }
    });
  }


  userInfo: any = null;
  idUser: string = '';



  getUserInfo() {
    this.authService.getUserInfo().subscribe(
      {
        next: (response) => {
          this.userInfo = response.user;
          this.idUser = this.userInfo.id;
          console.log('Informations utilisateur:', this.userInfo);
          this.initFormCaisse();
          this.initFormRecharger();
          this.verifierCaisse.patchValue({ utilisateurId: this.idUser });
        }
      }
    );
  }

  montant: number = 0;

  private initFormRecharger(): void {
    this.formRecharger = this.fb.group({
      utilisateurId: [this.idUser],
      montant: ['', Validators.required]
    });

  }

  private initFormCaisse(): void {
    this.verifierCaisse = this.fb.group({
      utilisateurId: [this.idUser],
      solde_dollars: ['', Validators.required],
      solde_euro: ['', Validators.required],
      solde_gnf: ['', Validators.required],
      prix_cfa: ['', Validators.required],
      solde_cfa: ['', Validators.required],
      prix_euro: ['', Validators.required],
      prix_dollar: ['', Validators.required]
    });
  }

  isLoading: boolean = false;

  solde_euro: number = 0;
  prix_euro: number = 0;
  solde_dollars: number = 0;
  prix_dollar: number = 0;
  solde_cfa: number = 0;
  prix_cfa: number = 0;
  solde_gnf: number = 0;

  ajouterCaisse(): void {
    this.isLoading = true;
    const formData = this.verifierCaisse.value;

    const solde_euro = parseInt(formData.solde_euro.replace(/,/g, ''), 10);
    const prix_euro = parseInt(formData.prix_euro.replace(/,/g, ''), 10);
    const solde_dollars = parseInt(formData.solde_dollars.replace(/,/g, ''), 10);
    const prix_dollar = parseInt(formData.prix_dollar.replace(/,/g, ''), 10);
    const solde_cfa = parseInt(formData.solde_cfa.replace(/,/g, ''), 10);
    const prix_cfa = parseInt(formData.prix_cfa.replace(/,/g, ''), 10);
    const solde_gnf = parseInt(formData.solde_gnf.replace(/,/g, ''), 10);


    this.verifierCaisseService.ajouterVerifierCaisse(
      {
        ...formData,
        solde_euro,
        prix_euro,
        solde_dollars,
        prix_dollar,
        solde_cfa,
        prix_cfa,
        solde_gnf
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          alert(response.message);
          this.getAllVerifierCaise();
          this.getAllSoldeCaisseParJours();
          this.verifierCaisse.patchValue({
            solde_dollars: '',
            solde_euro: '',
            solde_cfa: '',
            solde_gnf: '',
            prix_cfa: '',
            prix_euro: '',
            prix_dollar: ''
          });
        },
        error: (error) => {
          alert(error.error.message);
        }
      });
  }

  calculerBenefice() {
    if (this.dateDebut && this.dateFin) {
      this.financeService.getBenefice(this.dateDebut, this.dateFin).subscribe({
        next: (data) => {
          this.resultat = data;
          console.log(this.resultat);
          this.erreur = '';
        },
        error: (err) => {
          console.error('Erreur lors du calcul du bénéfice :', err);
          this.erreur = 'Erreur lors de la récupération des données.';
        },
      });
    } else {
      this.erreur = 'Veuillez sélectionner les deux dates.';
    }
  }

  entreDuJour: any;
  getCompteEntre(): void {
    this.entreService.getCompteEntrees().subscribe({
      next: (response) => {
        this.entreDuJour = response.nombre_entrees;
        console.log(this.entreDuJour);
      }
    });
  }

  sortieDuJour: any;
  getCompteSortie(): void {
    this.sortieSortie.getCompteSortie().subscribe({
      next: (response) => {
        this.sortieDuJour = response.nombre_Sortie;
        console.log(this.sortieDuJour);
      }
    });
  }

  payementDuJour: any;
  getComptePayement(): void {
    this.payementService.getComptePayement().subscribe({
      next: (response) => {
        this.payementDuJour = response.nombre_payement;
        console.log(this.payementDuJour);
      }
    });
  }



  echangeDuJour: any;
  getCompteEchange(): void {
    this.echangeService.getCompteEchange().subscribe({
      next: (response) => {
        this.echangeDuJour = response.nombre_echange;
        console.log(this.echangeDuJour);
      }
    });
  }

  echangePayementDuJour: any;
  getComptePayementEchange(): void {
    this.payementEchange.getComptePayemenEchange().subscribe({
      next: (response) => {
        this.echangePayementDuJour = response.nombre_Payement_echange;
        console.log(this.echangePayementDuJour);
      }
    });
  }


  montantDepenseDuJour: any;
  getSommeMontantDepense(): void {
    this.depenseService.getCompteDepense().subscribe({
      next: (response) => {
        this.montantDepenseDuJour = response.totalDepense;
        console.log(this.montantDepenseDuJour);
      }
    });
  }

  retourDuJour: any;
  getCompteDuJour(): void {
    this.rembourserService.getCompteRembourser().subscribe({
      next: (response) => {
        this.retourDuJour = response.nombre_rembourser;
        console.log(this.retourDuJour);
      }
    });
  }


  onInputChange(event: any): void {
    // Remplace tous les caractères non numériques (sauf les virgules) par une chaîne vide
    this.montant = event.target.value.replace(/[^0-9,]/g, '');
  }

  isRechargeLoading: boolean = false;

  rechargerSolde(): void {
    this.isRechargeLoading = true;
    const formData = this.formRecharger.value;

    // Supprimer les virgules et convertir la valeur en entier
    const montant = parseInt(formData.montant.replace(/,/g, ''), 10);  // Supprime les virgules et convertit en entier

    console.log(montant); // Affiche la valeur convertie

    // Passez la valeur convertie à la fonction rechargerSolde
    this.authService.rechargerSolde({ ...formData, montant }).subscribe({
      next: (response) => {
        this.getUserInfo();
        this.isRechargeLoading = false;
        alert(response.message);
      },
      error: (error) => {
        this.isRechargeLoading = false;
        alert("Erreur: " + error.error.message);
      }
    });
  }

  showMontantModal: boolean = false;
  showListeModal: boolean = false;


  openMontantModal() {
    this.showMontantModal = true;
  }

  closeMontantModal() {
    this.showMontantModal = false;
  }

  showUserModal: boolean = false;

  openUserModal() {
    this.showUserModal = true;
  }

  closeUserModal() {
    this.showUserModal = false;
  }

  openListeModal() {
    this.showListeModal = true;
    setTimeout(() => {
      this.initDataTable();
    }, 300);
  }

  closeListeModal() {
    this.showListeModal = false;
  }

}
