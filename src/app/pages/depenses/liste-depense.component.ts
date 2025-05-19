import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { DepenseService } from '../../services/depenses/depense.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { CurrencyFormatPipe } from '../dasboard/currency-format.pipe';

interface Result {
  date_creation: string;
  motif: string;
  montant: number;
}

@Component({
  selector: 'app-liste-depense',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule,
    CurrencyFormatPipe,
  ], // Enlever BrowserModule
  templateUrl: './liste-depense.component.html',
  styleUrl: './liste-depense.component.css',
})
export class ListeDepenseComponent implements OnInit {
  // Tableau pour stocker les résultats
  allresultat: Result[] = [];

  userInfo: any = null;
  idUser: string = '';

  depenseForm!: FormGroup;

  dtoptions: any = {};

  dtTrigger: Subject<any> = new Subject<any>();
  private dataTable: any;

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
        pageLength: 5,
        lengthMenu: [5, 10, 50],
        data: this.allresultat,
        order: [[0, 'desc']], // Assurez-vous que l'ordre est bien un tableau avec l'index et l'ordre
        columns: [
          {
            title: 'Date du jour',
            data: 'date_creation',
            render: (data: string) => {
              const date = new Date(data);
              return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
            },
          },
          {
            title: 'Motif',
            data: 'motif',
          },
          {
            title: 'Montant',
            data: 'montant',
            render: (data: number) => {
              // Ajout du formatage avec le GNF
              return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'GNF',
                currencyDisplay: 'symbol',
              }).format(data);
            },
          },
        ],
      });
      this.cd.detectChanges(); // Détection des changements si nécessaire
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

  constructor(
    private fb: FormBuilder,
    private depenseService: DepenseService,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire avec les validations
    this.initDepenseForm();
    this.getAllDepense();
    this.getUserInfo(); // Récupération des infos utilisateur
  }

  private initDepenseForm() {
    this.depenseForm = this.fb.group({
      utilisateurId: [this.idUser],
      motif: ['', Validators.required],
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
        this.initDepenseForm();
        // Mettre à jour le champ utilisateurId dans le formulaire
        this.depenseForm.patchValue({ utilisateurId: this.idUser });
      },
    });
  }

  getAllDepense() {
    // Appel à l'API et gestion des réponses
    this.depenseService.getAllDepense().subscribe({
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

  loading: boolean = false;

  montant: number = 0;

  onInputChange(event: any): void {
    this.montant = event.target.value.replace(/[^0-9,]/g, '');
  }
  onSubmit() {
    if (this.depenseForm.valid) {
      this.loading = true;
      const formData = this.depenseForm.value;
      const montant = parseInt(formData.montant.replace(/,/g, ''), 10);
      // Appeler le service pour ajouter le partenaire
      this.depenseService.ajoutDepense({ ...formData, montant }).subscribe(
        (response) => {
          this.getAllDepense();
          console.log('Deppense ajouté avec succès:', response);
          alert('Deppense ajouté avec succès!');
          this.depenseForm.patchValue({
            motif: '',
            montant: '',
          });
          this.loading = false;
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
