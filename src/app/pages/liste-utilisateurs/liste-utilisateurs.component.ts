import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UtilisateurService } from '../../services/utilisateurs/utilisateur.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';

// Interface utilisateur
interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  date_creation: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-liste-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, DataTablesModule],
  templateUrl: './liste-utilisateurs.component.html',
  styleUrl: './liste-utilisateurs.component.css',
})
export class ListeUtilisateursComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private dataTable: any;

  private initDataTable(): void {
    // Vérifiez si l'instance DataTable est déjà initialisée pour éviter de la réinitialiser plusieurs fois
    if ($.fn.dataTable.isDataTable('#datatable')) {
      this.dataTable.destroy(); // Détruire l'ancienne instance avant de créer une nouvelle
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
      data: this.users, // Utiliser les données déjà récupérées
      order: [0, 'desc'],
      columns: [
        { title: 'Nom', data: 'nom' },
        { title: 'Prenom', data: 'prenom' },
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
        { title: 'Email', data: 'email' },
        { title: 'Role', data: 'role' },
      ],
    });
    this.cd.detectChanges();
  }

  fetchUsers(): void {
    this.utilisateurService.getUsers().subscribe({
      next: (response) => {
        this.users = response;
        this.initDataTable(); // Initialiser ou réinitialiser DataTable après le chargement des utilisateurs
        this.cd.detectChanges(); // Mettre à jour le détecteur de changements pour actualiser la vue
      },
      error: (error) => {
        this.errorMessage = `Erreur : ${error.message}`;
        console.error(
          'Erreur lors de la récupération des utilisateurs :',
          error
        );
      },
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

  isLoading: boolean = false;

  user: User = this.getEmptyUser();
  users: User[] = [];
  errorMessage: string = '';
  userInfo: any = null; // Informations de l'utilisateur connecté

  // Recherche et filtres
  searchTerm: string = '';
  selectedRole: string = '';
  dtoptions: any = {};

  dtTrigger: Subject<any> = new Subject<any>();

  // Gestion des modales
  isAddUserModalOpen: boolean = false; // Modale d'ajout
  isEditStatusModalOpen: boolean = false; // Modale de modification de statut
  selectedUserId: number | null = null; // ID utilisateur sélectionné pour modification
  btEnabled: boolean = false; // Statut actuel de l'utilisateur sélectionné

  constructor(
    private utilisateurService: UtilisateurService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.userInfo = this.authService.getUserInfo();
    console.log('Informations utilisateur:', this.userInfo);
  }

  // Récupérer un utilisateur vide
  private getEmptyUser(): User {
    return {
      id: 0,
      nom: '',
      prenom: '',
      telephone: '',
      date_creation: '',
      email: '',
      role: '',
    };
  }

  /** Gestion des notifications */
  showNotification(message: string): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  /** Modale d'ajout d'utilisateur */
  openAddUserModal(): void {
    // this.resetForm();
    this.isAddUserModalOpen = true;
  }

  closeAddUserModal(): void {
    this.isAddUserModalOpen = false;
  }
  loading: boolean = false;

  addUser(): void {
    if (this.isValidForm()) {
      this.loading = true;
      this.utilisateurService.addUser(this.user).subscribe({
        next: () => {
          this.loading = false;
          // this.showNotification('Utilisateur ajouté avec succès !');
          alert('Utilisateur ajouté avec succès !');
          this.fetchUsers();
          this.closeAddUserModal();
        },
        error: (error) => {
          alert(error.error.message);
          // this.showNotification('Erreur lors de l\'ajout de l\'utilisateur.');
          console.error('Erreur :', error);
        },
      });
    } else {
      this.showNotification('Veuillez remplir tous les champs obligatoires.');
    }
  }

  /** Modale de modification de statut */
  openEditStatusModal(user: User): void {
    this.selectedUserId = user.id;
    this.isEditStatusModalOpen = true;
  }

  closeEditStatusModal(): void {
    this.isEditStatusModalOpen = false;
    this.selectedUserId = null;
    this.btEnabled = false;
  }

  modifierStatus(): void {
    if (this.selectedUserId === null) {
      this.showNotification(
        'Aucun utilisateur sélectionné pour la modification.'
      );
      return;
    }

    this.utilisateurService
      .updateStatusUtilisateur(this.selectedUserId, this.btEnabled)
      .subscribe({
        next: () => {
          this.showNotification(
            "Le statut de l'utilisateur a été modifié avec succès !"
          );
          this.fetchUsers();
          this.closeEditStatusModal();
        },
        error: (error) => {
          const message =
            error.status === 400 && error.error?.message
              ? error.error.message
              : `Erreur lors de la mise à jour : ${error.message}`;
          this.showNotification(message);
        },
      });
  }

  /** Utilitaires */
  resetForm(): void {
    this.user = this.getEmptyUser();
  }

  isValidForm(): boolean {
    return (
      this.user.nom.trim() !== '' &&
      this.user.prenom.trim() !== '' &&
      this.user.telephone.trim() !== '' &&
      this.user.email.trim() !== '' &&
      this.user.role.trim() !== ''
    );
  }
}
