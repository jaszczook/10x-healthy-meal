import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterLink
  ],
  template: `
    <mat-toolbar color="primary" *ngIf="isLoggedIn$ | async">
      <a routerLink="/dashboard" class="logo-link">
        <span class="logo">HM</span>
        <span class="title">HealthyMeal</span>
      </a>

      <span class="spacer"></span>

      <button mat-button [matMenuTriggerFor]="userMenu">
        <mat-icon>account_circle</mat-icon>
        <span>Account</span>
      </button>

      <mat-menu #userMenu="matMenu">
        <button mat-menu-item routerLink="/preferences">
          <mat-icon>settings</mat-icon>
          <span>Preferences</span>
        </button>
        <button mat-menu-item (click)="handleLogout()">
          <mat-icon>exit_to_app</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    :host {
      display: block;
    }
    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: white;
      margin-right: 16px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      margin-right: 8px;
    }
    .title {
      font-size: 20px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    mat-toolbar {
      padding: 0 16px;
    }
  `]
})
export class NavigationComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  readonly isLoggedIn$ = this.authService.isLoggedIn$;

  handleLogout() {
    this.authService.logout().subscribe();
  }
} 