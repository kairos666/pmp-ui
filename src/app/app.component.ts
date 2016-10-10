/* tslint:disable:no-unused-variable */
import { Component, ViewChild } from '@angular/core';
import { MdSidenav } from "@angular/material";

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
  private currentDog = {};
  private dogs = [
    {rows: 2, name: "Mal", human: "Jeremy", age: 5},
    {rows: 1, name: "Molly", human: "David", age: 5},
    { rows: 1, name: "Sophie", human: "Alex", age: 8},
    {rows: 2, name: "Taz", human: "Joey", age: '11 weeks'},
    { rows: 1, name: "Kobe", human: "Igor", age: 5},
    {rows: 2, name: "Porter", human: "Kara", age: 3},
    { rows: 1, name: "Stephen", human: "Stephen", age: 8},
    {rows: 1, name: "Cinny", human: "Jules", age: 3},
    { rows: 1, name: "Hermes", human: "Kara", age: 3},
  ];
  @ViewChild('sidenav') sidenav: MdSidenav;

  constructor (private configModel:ConfigModelService) {
    // instanciate app-wide dependencies for singleton injections
  }

  private showDog(dog) {
    this.currentDog = dog;
    this.sidenav.open();
  }
}
