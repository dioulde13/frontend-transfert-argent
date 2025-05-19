import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common'; // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { RembourserService } from '../../services/rembourser/rembourser.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';
import { DeviseService } from '../../services/devise/devise.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { CalculBeneficeService } from '../../services/calculBenefices/calcul-benefice.service';
import { FormsModule } from '@angular/forms';
import { EntreServiceService } from '../../services/entre/entre-service.service';
import { HttpClient } from '@angular/common/http';
import { CurrencyFormatPipe } from '../dasboard/currency-format.pipe';
// import { FormatNumberDirective } from '../../services/rembourser/format-number.directive';
import { SortieService } from '../../services/sortie/sortie.service';

interface Result {
  date_creation: string;
  nom: string;
  prix: number;
  montant_gnf: number;
  montant: number;
  id: number;
}

@Component({
  selector: 'app-liste-rembourser',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule,
    FormsModule,
    CurrencyFormatPipe,
    // FormatNumberDirective
  ],
  templateUrl: './liste-rembourser.component.html',
  styleUrl: './liste-rembourser.component.css',
})
export class ListeRembourserComponent implements OnInit, AfterViewInit {
  // Tableau pour stocker les résultats
  allresultat: Result[] = [];
  allEntre: any[] = [];

  userInfo: any = null;
  idUser: string = '';
  private dataTable: any;

  rembourserForm!: FormGroup;

  editDeviseForm!: FormGroup;

  filteredResults: any[] = [];

  startDate: Date | null = null;
  endDate: Date | null = null;

  totalMontant: number = 0; // Initialisation
  totalMontantDevise: number = 0; // Initialisation

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

       this.totalMontantDevise = filteredDataTable.reduce(
        (sum: number, row: { montant: number }) => sum + (row.montant || 0),
        0
      );
    
    }, 200); 
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
            render: (data: string) => {
              const date = new Date(data);
              const formattedDate = date.toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              return `${formattedDate}`;
            },
          },
          { title: 'Nom', data: 'nom' },
          {
            title: 'Prix',
            data: 'prix',
            render: (data: number, type: any, row: any) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data); // Format le montant sans symbole de devise

              // Si vous avez besoin d'utiliser `signe_2`, vous pouvez l'ajouter ici
              // const signe = row.signe_1; // Récupérer la valeur de `signe_2`

              // Retourner le montant et le signe, par exemple
              return `${formattedAmount} GNF`;
            },
          },
          {
            title: 'Montant',
            data: 'montant',
            render: (data: number, type: any, row: any) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data); // Format le montant sans symbole de devise

              // Si vous avez besoin d'utiliser `signe_2`, vous pouvez l'ajouter ici
              // const signe = row.signe_2; // Récupérer la valeur de `signe_2`

              // Retourner le montant et le signe, par exemple
              return `${formattedAmount} XOF`;
            },
          },
          {
            title: 'Montant GNF',
            data: 'montant_gnf',
            render: (data: number, type: any, row: any) => {
              const formattedAmount = new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data); 
              return `${formattedAmount} GNF`;
            },
          },
          {
            title: 'Partenaire',
            data: null,
            render: (data: number, type: any, row: any) => {
              if (!data || !row.Partenaire) return '';
              return ` ${row.Partenaire.prenom} ${row.Partenaire.nom} (${row.Partenaire.pays})`;
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

  dtTrigger: Subject<any> = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private deviseService: DeviseService,
    private partenaireService: PartenaireServiceService,
    private rembourserService: RembourserService,
    private calculService: CalculBeneficeService,
    private entreService: EntreServiceService,
    private sortieService: SortieService,
    private cd: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  selectedDevise: any = null; // Devise sélectionnée pour modification

  onUpdate() {
    if (this.editDeviseForm.valid && this.selectedDevise) {
      const updatedData = this.editDeviseForm.value;
      this.deviseService
        .modifierDevise(this.selectedDevise.id, updatedData)
        .subscribe(
          (response) => {
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

  onEdit(devise: any) {
    this.selectedDevise = devise;
    this.editDeviseForm.patchValue({
      paysArriver: devise.paysArriver,
      signe_2: devise.signe_2,
      prix_1: devise.prix_1,
      prix_2: devise.prix_2,
    });
  }

  ngOnInit(): void {
    this.editDeviseForm = this.fb.group({
      paysArriver: ['', Validators.required],
      signe_2: ['', Validators.required],
      prix_1: ['', Validators.required],
      prix_2: ['', Validators.required],
    });
    this.getAllRemboursement();
    this.filteredResults = [...this.allresultat];
    // Initialisation du formulaire avec les validations
    this.rembourserForm = this.fb.group({
      utilisateurId: [this.idUser],
      partenaireId: ['', Validators.required],
      nom: [''],
      prix: [0],
      montant: [0, [Validators.required, Validators.min(0)]],
    });
    this.rembourserPartenaireForm = this.fb.group({
      partenaireEntreId: ['', Validators.required],
      partenaireSortieId: ['', Validators.required]
    });
    this.fetchPartenaireEntre();
    this.fetchPartenaireSortie();
    this.fetchPartenaire();
    this.fetchDevise();
    this.getUserInfo(); 
    this.getAllEntre();
    this.getAllSortie();
  }

  getUserInfo() {
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        this.userInfo = response.user;
        //   if (this.userInfo) {
        this.idUser = this.userInfo.id;
        console.log('Informations utilisateur:', this.userInfo);

        // Mettre à jour le champ utilisateurId dans le formulaire
        this.rembourserForm.patchValue({ utilisateurId: this.idUser });
      },
    });
  }

  montant: number = 0;

  onInputChange(event: any): void {
    this.montant = event.target.value.replace(/[^0-9,]/g, '');
  }

  isLoading: boolean = false;

  onSubmit() {
    this.isLoading = true;
    if (this.rembourserForm.valid) {
      const formData = this.rembourserForm.value;
      const montant = parseInt(formData.montant.replace(/,/g, ''), 10);

      this.rembourserService
        .ajouterRembourser({ ...formData, montant })
        .subscribe(
          (response) => {
            this.isLoading = false;
            console.log('Remboursement ajouté avec succès:', response);
            this.getAllRemboursement();
            this.rembourserForm.patchValue({
              partenaireId: '',
              nom: '',
              prix: '',
              montant: '',
            });
            alert(response.message);
          },
          (error) => {
            this.isLoading = false;
            console.error("Erreur lors de l'ajout du partenaire:", error);
            alert(error.error.message);
          }
        );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
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

  allPartenaireSortie: any[] = [];

  // Récupération des devises
  fetchPartenaireSortie(): void {
    this.partenaireService.getAllPartenaire().subscribe(
      (response) => {
        this.allPartenaireSortie = response.filter(
          (partenaire: any) => partenaire.pays === 'Guinée-Bissau'
        );
        console.log('Liste des partenaires:', this.allPartenaireSortie);
      },
      (error) => {
        console.error('Erreur lors de la récupération des partenaires:', error);
      }
    );
  }


  allPartenaireEntre: any[] = [];

  // Récupération des devises
  fetchPartenaireEntre(): void {
    this.partenaireService.getAllPartenaire().subscribe(
      (response) => {
        this.allPartenaireEntre = response.filter(
          (partenaire: any) => partenaire.pays === 'Sénégal'
        );
        console.log('Liste des partenaires:', this.allPartenaireEntre);
      },
      (error) => {
        console.error('Erreur lors de la récupération des partenaires:', error);
      }
    );
  }

  allPartenaire: any[] = [];

  // Récupération des devises
  fetchPartenaire(): void {
    this.partenaireService.getAllPartenaire().subscribe(
      (response) => {
        this.allPartenaire = response;
        if (this.allPartenaire && this.allPartenaire.length > 0) {
          this.dtTrigger.next(null); // Initialisation de DataTables
        }
        console.log('Liste des partenaires:', this.allPartenaire);
      },
      (error) => {
        console.error('Erreur lors de la récupération des partenaires:', error);
      }
    );
  }
  

  private getAllRemboursement(): void {
    // Appel à l'API et gestion des réponses
    this.rembourserService.getAllRebourser().subscribe({
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

  dateDebut: string = '';
  dateFin: string = '';
  montantR: number = 0;
  prix: number = 0;
  prix_1: number = 0; 
  resultats: any;
  benefice: any;

  onInputChangeCalcule(event: any): void {
    this.montantR = event.target.value.replace(/[^0-9,]/g, '');
  }

  // onCalculer() {
  //   const montantRNet = Number(this.montantR.toString().replace(/\s/g, ''));
  //   const prix1Net = Number(this.prix_1.toString().replace(/\s/g, ''));
  //   const prixNet = Number(this.prix.toString().replace(/\s/g, ''));
  
  //   this.calculService.calculerBenefice(
  //       this.dateDebut,
  //       this.dateFin,
  //       montantRNet,
  //       prix1Net,
  //       prixNet
  //     )
  //     .subscribe(
  //       (response) => {
  //         console.log(this.dateDebut);
  //         console.log(this.dateFin);
  //         console.log(montantRNet);
  //         console.log(prix1Net);
  //         console.log(prixNet);
  //         this.resultats = response;
  //         this.benefice = response.totalMontantGnf - response.montantGnfSaisi;
  //         // console.log(this.resultats);
  //       },
  //       (error) => {
  //         console.error('Erreur:', error);
  //       }
  //     );
  // }

  dateDebutPayer: string = ''; // Stocke la date de début
  dateFinPayer: string = ''; // Stocke la date de fin
  searchNom: string = ''; // Stocke la recherche par nom

  private getAllEntre(): void {
    this.entreService.getAllEntree().subscribe({
      next: (response) => {
        console.log(response);
        // Appliquer le filtre de base (exclure "ANNULEE" et "R")
        this.allEntre = response.filter(
          (entre: any) => entre.status !== 'NON PAYEE' && entre.status !== 'ANNULEE' && entre.type === 'NON R' && entre.montant_cfa > 0
        );
     console.log(this.allEntre);
        // Appliquer les filtres supplémentaires
        this.filtrerEntre();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des entrées :', error);
      },
    });
  }

 

  filteredEntre: any[] = []; // Liste filtrée affichée dans le tableau
montantTotal: any;
  filtrerEntre() {
    this.montantTotal = 0; // Réinitialiser le montant total
  
    this.filteredEntre = this.allEntre.filter((entre: any) => {
      const dateCreation = new Date(entre.date_creation);
      const debut = this.dateDebut ? new Date(this.dateDebut) : null;
      const fin = this.dateFin ? new Date(this.dateFin) : null;
  
      const estDansIntervalle =
        (!debut || dateCreation >= debut) && (!fin || dateCreation <= fin);
  
      const nomComplet =
        `${entre.Partenaire.prenom} ${entre.Partenaire.nom}`.toLowerCase();
      const correspondNom =
        !this.searchNom || nomComplet.includes(this.searchNom.toLowerCase());
  
      const valide = estDansIntervalle && correspondNom;
      if (valide) {
        this.montantTotal += entre.montant_cfa; 
      }
  
      return valide;
    });
  }

  allSortie: any[] = [];

  private getAllSortie(): void {
    this.sortieService.getAllSortie().subscribe({
      next: (response) => {
        console.log(response);
        this.allSortie = response.filter(
          (entre: any) => entre.status !== 'NON PAYEE' && entre.status !== 'ANNULEE' && entre.type === 'NON R' && entre.montant > 0 && entre.status === 'PAYEE'
        );
     console.log(this.allSortie);
     this.filtrerSortie();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des sorties :', error);
      },
    });
  }


  dateDebutSortie: string = '';
  dateFinSortie: string = '';

  filteredSortie: any[] = []; 
  montantTotalSortie: any;
    filtrerSortie() {
      this.montantTotalSortie = 0; 
    
      this.filteredSortie = this.allSortie.filter((sortie: any) => {
        const dateCreation = new Date(sortie.date_creation);
        const debut = this.dateDebutSortie ? new Date(this.dateDebutSortie) : null;
        const fin = this.dateFinSortie ? new Date(this.dateFinSortie) : null;
    
        const estDansIntervalle =
          (!debut || dateCreation >= debut) && (!fin || dateCreation <= fin);
    
        const nomComplet =
          `${sortie.Partenaire.prenom} ${sortie.Partenaire.nom}`.toLowerCase();
        const correspondNom =
          !this.searchNom || nomComplet.includes(this.searchNom.toLowerCase());
    
        const valide = estDansIntervalle && correspondNom;
        if (valide) {
          this.montantTotalSortie += sortie.montant; 
        }
    
        return valide;
      });
    }


    modalRemboursementOuvert = false;

    ouvrirModalRemboursement() {
      this.modalRemboursementOuvert = true;
    }
  
    fermerModalRemboursement() {
      this.modalRemboursementOuvert = false;
    }

    rembourserPartenaireForm!: FormGroup;

    payerSelectionSortie() {
      const selectedSorties = this.allSortie
        .filter(sortie => sortie.selected)
        .map(sortie => sortie.id);
    
      if (selectedSorties.length === 0) {
        alert('Veuillez sélectionner au moins une ligne.');
        return;
      }
    
      const partenaireEntreId = this.rembourserPartenaireForm.value.partenaireEntreId;

    const  partenaireSortieId = this.rembourserPartenaireForm.value.partenaireSortieId;
    
      if (!partenaireEntreId) {
        alert('Veuillez sélectionner un partenaire.');
        return;
      }

      if (!partenaireSortieId) {
        alert('Veuillez sélectionner un partenaire.');
        return;
      }
    
      const payload = {
        ids: selectedSorties,
        partenaireEntreId: partenaireEntreId,
        partenaireSortieId: partenaireSortieId
      };

      console.log(payload);
    
      this.http.post('http://localhost:3000/api/sorties/payer', payload)
        .subscribe({
          next: (response: any) => {
            alert(response.message);
            this.getAllSortie(); // recharge les données après paiement
          },
          error: (error) => {
            const errorMessage = error.error?.message || 'Une erreur est survenue.';
            alert(errorMessage);
          }
        });
    }
    

  toggleAllSelectionSortie(event: any) {
    const checked = event.target.checked;
    this.allSortie.forEach((sortie) => (sortie.selected = checked));
  }
  

  payerSelectionEntre() {
    const selectedEntries = this.allEntre
      .filter((entry) => entry.selected)
      .map((entry) => entry.id);

    if (selectedEntries.length === 0) {
      alert('Veuillez sélectionner au moins une ligne.');
      return;
    }

    this.http
      .post('http://localhost:3000/api/entrees/payer', { ids: selectedEntries })
      .subscribe({
        next: (response: any) => {
          alert(response.message); // Affiche le message du backend en cas de succès
          this.getAllEntre();
        },
        error: (error) => {
          // Vérifier si le serveur renvoie un message d'erreur et l'afficher
          const errorMessage =
            error.error && error.error.message
              ? error.error.message
              : 'Une erreur est survenue.';

          alert(errorMessage);
        },
      });
  }

  toggleAllSelectionEntre(event: any) {
    const checked = event.target.checked;
    this.allEntre.forEach((entry) => (entry.selected = checked));
  }
}
