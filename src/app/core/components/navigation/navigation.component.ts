import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [MatTabsModule, MatToolbarModule, RouterLink, RouterLinkActive],
  template: `
    <mat-toolbar color="primary">
      <mat-tab-group (selectedTabChange)="onTabChange($event)">
        <mat-tab label="Dashboard" [routerLink]="['/dashboard']"></mat-tab>
        <mat-tab label="New Recipe" [routerLink]="['/recipes/new']"></mat-tab>
        <mat-tab label="Preferences" [routerLink]="['/preferences']"></mat-tab>
      </mat-tab-group>
    </mat-toolbar>
  `,
  styles: [`
    :host {
      display: block;
    }
    .active {
      color: white;
    }
    mat-toolbar {
      padding: 0;
    }
    ::ng-deep .mat-mdc-tab-group {
      width: 100%;
    }
  `]
})
export class NavigationComponent {
  constructor(private router: Router) {}

  onTabChange(event: any) {
    const routes = ['/dashboard', '/recipes/new', '/preferences'];
    this.router.navigate([routes[event.index]]);
  }
} 