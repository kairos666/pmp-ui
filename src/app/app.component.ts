/* tslint:disable:no-unused-variable */
import { Component, ViewChild } from '@angular/core';
import { MdSidenav } from '@angular/material';

/* GLOBAL SERVICES */
import { PmpEngineConnectorService } from './services/pmp-engine-connector.service';
import { ConfigModelService } from './model/config-model.service';
import { LogsService } from './model/logs-model.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('sidenav') sidenav: MdSidenav;

  constructor (
    private configModel:ConfigModelService, 
    private pmpEngine:PmpEngineConnectorService,
    private logService:LogsService
  ) {
    // instanciate app-wide dependencies to make sure they start at the very beginning
  }

  private mainNavSelection():void { this.sidenav.close(); }
  private mainNavOpen():void { this.sidenav.open(); }
  private startPmpEngine():void { this.configModel.start(); }
  private stopPmpEngine():void { this.configModel.stop(); }
}
