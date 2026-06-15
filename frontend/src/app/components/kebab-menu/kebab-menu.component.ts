import {Component, Input, signal} from '@angular/core';

export type MenuItem = {
  label: string;
  action: () => void;
}

@Component({
  selector: 'app-kebab-menu',
  imports: [],
  template: `
    <div class="kebab-wrapper">
      <button (click)="toggle()" class="kebab-button">
        &#8942;
      </button>
      @if (open()) {
        <ul class="kebab-menu">
          @for (item of items; track item.label) {
            <li (click)="onItemClick(item)">
              {{ item.label }}
            </li>
          }
        </ul>
      }
    </div>
  `,
  styleUrl: './kebab-menu.component.css',
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
