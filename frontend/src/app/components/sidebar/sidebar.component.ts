import { Component } from '@angular/core';
import {AccordionItemComponent} from '../accordion-item/accordion-item.component';

@Component({
  selector: 'app-sidebar',
  imports: [
    AccordionItemComponent
  ],
  template: `
    <div class="sideBar">
      <app-accordion-body title="Shelves"/>
    </div>
  `,
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {}
