/* tslint:disable:no-unused-variable */
import { Component } from '@angular/core';

/* GLOBAL SERVICES */
import { LocalStorageService } from './services/local-storage.service';
import { ConfigStorageService } from './services/config-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LocalStorageService, ConfigStorageService]
})
export class AppComponent {
  private title = 'app works!';

  constructor (
    private configStorageService: ConfigStorageService
  ) {
    // instanciate app-wide dependencies for singleton injections
  }
}
