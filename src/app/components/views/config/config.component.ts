import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
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
  private selectedTab = 0;
  private killSubs = new Subject();

  constructor(private configModel:ConfigModelService, private route:ActivatedRoute, private router:Router) { }

  ngOnInit():void {
    // get optional route params for tab selection
    this.route.params.takeUntil(this.killSubs).subscribe(params => {
      if((<any>params).selectedTabIndex) {
        this.selectedTab = +(<any>params).selectedTabIndex;
      }
    });

    // handle aActions stream
    this.configModel.availableConfigActionsStream.takeUntil(this.killSubs).subscribe(aActions => {
      this.isSaveAllowed = aActions.saveAllowed;
      this.isRestoreAllowed = aActions.restoreAllowed;
      this.isApplyAllowed = (aActions.startAllowed || aActions.restartAllowed);
    });
  }

  ngOnDestroy():void {
    this.killSubs.next(true);
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
      switch(event.formId) {
        case 'general-pimp-form':
          configParameters[1] = event.target;
          configParameters[3] = event.port;
          configParameters[2] = event.cookies;
        break;

        case 'rules-pimp-form':
          configParameters[4] = event.pimpCmds;
        break;
      }

      this.configModel.updateConfig(new (<any>PimpConfig)(...configParameters));
    } else {
      // invalid pimp form update
      this.isSaveAllowed = false;
      this.isApplyAllowed = false;
    }
  }
}
