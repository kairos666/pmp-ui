import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigModelService } from '../../../model/config-model.service';
import { PimpConfig, deconstructPimpConfig } from '../../../schema/config';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit, OnDestroy {
  private isSaveAllowed:boolean;
  private isRestoreAllowed:boolean;
  private isApplyAllowed:boolean;
  private sub:Subscription;

  constructor(private configModel:ConfigModelService) { }

  ngOnInit():void {
    this.sub = this.configModel.availableConfigActionsStream.subscribe(aActions => {
      this.isSaveAllowed = aActions.saveAllowed;
      this.isRestoreAllowed = aActions.restoreAllowed;
      this.isApplyAllowed = aActions.startAllowed;
    });
  }

  ngOnDestroy():void {
    this.sub.unsubscribe();
  }

  private onSaveClick():void {
    this.configModel.save();
  }

  private onRestoreClick():void {
    this.configModel.restore();
  }

  private onApplyClick():void {
    this.configModel.start();
  }

  private onUpdateConfig(event):void {
    if (event.formValidity) {
      let configParameters = deconstructPimpConfig(this.configModel.config);

      // general pimp form case
      if (event.formId === 'general-pimp-form') {
        configParameters[1] = event.target;
        configParameters[3] = event.port;
        configParameters[2] = event.cookies;
      }

      this.configModel.updateConfig(new (<any>PimpConfig)(...configParameters));
    } else {
      // invalid pimp form update
      this.isSaveAllowed = false;
      this.isApplyAllowed = false;
    }
  }
}
