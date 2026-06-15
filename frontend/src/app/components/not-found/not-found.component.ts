import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [],
  template: `
    <div class="not-found">
      <h1>404</h1>
      <p>Page not found</p>

      <button (click)="goHome()">
        Return
      </button>
    </div>
  `,
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent {
  constructor(private router: Router) {}
  goHome() {
    this.router.navigate(['']);
  }
}
