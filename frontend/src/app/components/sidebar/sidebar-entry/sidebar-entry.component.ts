import {Component, inject, Input, signal} from '@angular/core';
import {Router} from '@angular/router';
import {KebabMenuComponent, MenuItem} from '../../kebab-menu/kebab-menu.component';
import {PromptComponent} from '../../prompt/prompt.component';
import {ShelfService} from '../../../services/shelf.service';

@Component({
  selector: 'app-sidebar-entry',
  imports: [
    KebabMenuComponent,
    PromptComponent
  ],
  template: `
    <div class="shelf_entry" (click)="goToShelf()">
        <span class="shelf_wrapper">
            <p class="shelf_name">{{ name }}</p>
            <p class="count">{{ count }}</p>
            <div class="shelf-menu">
              <app-kebab-menu
                [items]="menuItems"
              />
            </div>
        </span>
        <app-prompt-component
            [open]="promptOpen()"
            (close)="onClose()"
            [title]="'Rename shelf'"
            (submit)="handleRenameShelf($event)"
        />
    </div>
  `,
  styleUrl: './sidebar-entry.component.css',
})
export class SidebarEntryComponent {
  @Input() name!: string;
  @Input() count!: number;
  promptOpen = signal<boolean>(false);
  shelfService = inject(ShelfService);
  menuItems: MenuItem[] = [
    {label: 'Rename shelf', action: () => {this.openPrompt()}},
    {label: 'Delete shelf', action: () => {
      this.shelfService.deleteShelf(this.name)
        .subscribe({
          next: () => {
            this.shelfService.getSidebarData();
            this.router.navigate(['']);
            console.log('Shelf deleted');
          },
          error: (err) => {console.error('Failed to delete shelf', err)}
        });
    }},
  ]

  constructor(private router: Router) {}

  goToShelf() {
    this.router.navigate(['/s', this.name])
  }

  handleRenameShelf(newShelfName: string) {
    if (!newShelfName || newShelfName == '') return;
    this.shelfService.renameShelf(this.name, newShelfName)
      .subscribe({
        next: () => {
          this.shelfService.getSidebarData();
          console.log('Shelf renamed');
        },
        error: (err) => {
          console.error('Failed to rename shelf', err);
        }
      });
  }

  openPrompt() {
    this.promptOpen.set(true);
  }
  onClose() {
    this.promptOpen.set(false);
  }
}
