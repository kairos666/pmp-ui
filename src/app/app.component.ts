/* tslint:disable:no-unused-variable */
import { Component } from '@angular/core';

/* GLOBAL SERVICES */
import { LocalStorageService } from './services/local-storage.service';
import { ConfigStorageService } from './services/config-storage.service';
import { SocketConnectorService } from './services/socket-connector.service';
import { PmpEngineConnectorService } from './services/pmp-engine-connector.service';
import { ConfigModelService } from './model/config-model.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ConfigModelService, LocalStorageService, ConfigStorageService, SocketConnectorService, PmpEngineConnectorService]
})
export class AppComponent {
  private title = 'app works!';

  constructor () {
    // instanciate app-wide dependencies for singleton injections
  }
}
