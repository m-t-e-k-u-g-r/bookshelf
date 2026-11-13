import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private _addBookPromptOpen = signal(false);

  addBookPromptOpen = this._addBookPromptOpen.asReadonly();

  updateBookPrompt(open: boolean) {
    this._addBookPromptOpen.set(open);
  }
}
