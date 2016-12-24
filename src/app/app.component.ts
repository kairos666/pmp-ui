/* tslint:disable:no-unused-variable */
import { Component, ViewChild } from '@angular/core';
import { MdSidenav, MdSnackBar } from '@angular/material';
import { notifTranslator } from './utils/utils-functions';

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
    private logService:LogsService,
    private snackBar: MdSnackBar
  ) {
    // instanciate app-wide dependencies to make sure they start at the very beginning

    // bind notification stream to snackbar UI
    this.configModel.notificationsStream.subscribe(notif => {
      this.snackBar.open(notifTranslator(notif), null, {
        duration: 200000,
      });
    });
  }

  private mainNavSelection():void { this.sidenav.close(); }
  private mainNavOpen():void { this.sidenav.open(); }
  private startPmpEngine():void { this.configModel.start(); }
  private stopPmpEngine():void { this.configModel.stop(); }
}
