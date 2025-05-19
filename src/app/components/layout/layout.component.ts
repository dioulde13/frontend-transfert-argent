import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service.service';
import { RouterLink} from '@angular/router';


@Component({
  selector: 'app-layout',
  imports: [
    CommonModule ,
    RouterOutlet,
    RouterLink
    ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit{

  userInfo: any = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Récupérer les informations de l'utilisateur connecté
    this.userInfo = this.authService.getUserInfo();
    console.log('Informations utilisateur:', this.userInfo);
  }

  isSidebarOpen = false;
  activeMenu = 'home'; // Home sélectionné par défaut

  selectMenu(menu: string) {
    this.activeMenu = menu;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSideBar() {
    this.isSidebarOpen = false;
  }

  isDropdownOpen = false;


  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Rediriger vers la page de login après déconnexion
  }
}
