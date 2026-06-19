import {Component, inject, Input, signal} from '@angular/core';
import {ShelfService} from '../../services/shelf.service';
import {SidebarEntryComponent} from '../sidebar/sidebar-entry/sidebar-entry.component';
import {PromptComponent} from '../prompt/prompt.component';

import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'app-accordion-body',
  imports: [
    SidebarEntryComponent,
    PromptComponent,
    MatButtonModule,
    MatExpansionModule
  ],
  template: `
    <mat-accordion>
      <mat-expansion-panel [expanded]="isOpen()" (expandedChange)="isOpen.set($event)">
        <mat-expansion-panel-header>
          <mat-panel-title>
            {{ title }}
          </mat-panel-title>
        </mat-expansion-panel-header>

        <div class="accordion_content">
          @for (entry of shelfService.sidebarData(); track entry.name) {
            <app-sidebar-entry
              [name]="entry.name"
              [count]="entry.count"
            />
          }
          <button
              mat-button
              (click)="openPrompt()"
              class="create_shelf_button"
          >
            Create Shelf
          </button>
        </div>
      </mat-expansion-panel>
    </mat-accordion>

    <app-prompt-component
      [open]="promptOpen()"
      (close)="onClose()"
      [title]="'New shelf'"
      [message]="'Please enter a name for the new shelf'"
      (submit)="handleCreateShelf($event)"
    />
  `,
  styleUrl: './accordion-item.component.scss',
})
export class AccordionItemComponent {
  shelfService = inject(ShelfService);
  isOpen = signal(true);
  promptOpen = signal(false);
  @Input() title!: string;

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  handleCreateShelf(shelfName: string) {
    if (!shelfName || shelfName == '') return;
    this.shelfService.createShelf(shelfName).subscribe({
      next: () => {
        this.shelfService.getSidebarData();
        console.log('Shelf created');
      },
      error: (err) => {
        console.error('Failed to create shelf', err);
      }
    })
  }

  openPrompt() {
    this.promptOpen.set(true);
  }
  onClose () {
    this.promptOpen.set(false);
  }
}
