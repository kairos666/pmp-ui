import { Component } from '@angular/core';
import { ConfigModelService } from '../../../model/config-model.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent {
  private isSaveAllowed:boolean;
  private isRestoreAllowed:boolean;
  private isApplyAllowed:boolean;

  constructor(private configModel:ConfigModelService) { }

  private onSaveClick():void {
    console.log('save clicked');
  }

  private onRestoreClick():void {
    console.log('restore clicked');
  }

  private onApplyClick():void {
    console.log('apply config clicked');
  }
}
