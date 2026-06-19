import {Component, Input, signal} from '@angular/core';

export type MenuItem = {
  label: string;
  action: () => void;
}

import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-kebab-menu',
  imports: [
    MatMenuModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Book actions">
      <mat-icon>more_vert</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
      @for (item of items; track item.label) {
        <button mat-menu-item (click)="onItemClick(item)">
          <span>{{ item.label }}</span>
        </button>
      }
    </mat-menu>
  `,
  styleUrl: './kebab-menu.component.scss',
})
export class KebabMenuComponent {
  @Input() items!: MenuItem[];
  open = signal(false);

  onItemClick(item: MenuItem) {
    item.action();
  }

  toggle() {
    this.open.update(o => !o);
  }
}
