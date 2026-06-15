import {Component, inject, Input, signal} from '@angular/core';
import {ShelfService} from '../../services/shelf.service';
import {SidebarEntryComponent} from '../sidebar/sidebar-entry/sidebar-entry.component';
import {PromptComponent} from '../prompt/prompt.component';

@Component({
  selector: 'app-accordion-body',
  imports: [
    SidebarEntryComponent,
    PromptComponent
  ],
  template: `
    <div class="custom_accordion">
      <div class="accordion_item">
        <button class="accordion_header" (click)="toggle()">
          {{ title }}
        </button>
        @if (isOpen()) {
          <div class="accordion_body">
            @for (entry of shelfService.sidebarData(); track entry.name) {
              <app-sidebar-entry
                [name]="entry.name"
                [count]="entry.count"
              />
            }
            <button
                (click)="openPrompt()"
                class="create_shelf_button"
            >
              Create Shelf
            </button>
          </div>
        }
        <app-prompt-component
          [open]="promptOpen()"
          (close)="onClose()"
          [title]="'New shelf'"
          [message]="'Please enter a name for the new shelf'"
          (submit)="handleCreateShelf($event)"
        />
      </div>
    </div>
  `,
  styleUrl: './accordion-item.component.css',
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
