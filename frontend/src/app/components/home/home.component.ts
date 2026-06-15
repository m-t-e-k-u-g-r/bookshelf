import {Component, signal} from '@angular/core';
import {NavComponent} from '../nav/nav.component';
import {RouterLink} from '@angular/router';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {ShelfComponent} from '../shelf/shelf.component';

@Component({
  selector: 'app-home',
  imports: [
    NavComponent,
    RouterLink,
    SidebarComponent,
    ShelfComponent
  ],
  template: `
    <app-nav />
    <h1 id="title">
      <a routerLink="/">
        {{ title() }}
      </a>
    </h1>
    <div class="container">
      <app-sidebar />
      <app-shelf />
    </div>
  `,
  styleUrl: './home.component.css',
})
export class HomeComponent {
  title = signal('Bookshelf (Angular)');
}
