import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { PimpConfig, PmpPluginDescriptor } from '../../../../schema/config';
import { PluginFormData } from '../../../../schema/pimp-form-plugin-data';
import { MdDialog, MdDialogRef } from '@angular/material';
import { PluginReadmeComponent } from '../../dialogs/plugin-readme/plugin-readme.component';

@Component({
  selector: 'app-pimp-form-plugins',
  templateUrl: './pimp-form-plugins.component.html',
  styleUrls: ['./pimp-form-plugins.component.scss']
})
export class PimpFormPluginsComponent implements OnInit, OnDestroy {
  @Input() pimpConfigInit:Observable<PimpConfig>; // always send current config (no distinct)
  @Input() pimpConfigChanges:Observable<PimpConfig>; // only works when config change
  @Input() availablePluginsPromise:Promise<PmpPluginDescriptor[]>;
  @Output() updatePimpConfig = new EventEmitter();
  private metaFormData:PluginFormData[];
  private pimpPluginsForm:FormGroup;
  private killSubs = new Subject();
  private isLoadingAvailablePlugins = true;
  private dialogRef: MdDialogRef<PluginReadmeComponent>;

  constructor(private formBuilder:FormBuilder, private dialog:MdDialog) { }

  ngOnInit() {
    // create initial form model
    this.pimpPluginsForm = this.formBuilder.group({
      plugins: this.formBuilder.array([])
    });

    // handle form updates
    this.pimpPluginsForm.valueChanges.takeUntil(this.killSubs)
      .debounceTime(200) /* to avoid too many consecutive calls */
      .subscribe(plugins => {
        this.updateUpstream();
      });

    // update initial paramters
    this.pimpConfigInit.first().subscribe(firstConfig => {
      this.updateFormValues(firstConfig.plugins);

      // react to new config parameters incoming
      this.pimpConfigChanges.takeUntil(this.killSubs).subscribe(newConfig => {
        // update params
        this.updateFormValues(newConfig.plugins);
      });
    });
  }

  private updateUpstream():void {
    // fill pimp plugins current values
    const pluginsArray = <FormArray>this.pimpPluginsForm.controls['plugins'];
    const formValidity = pluginsArray.valid;
    let pluginConfig = [];
    pluginsArray.controls.forEach((item, index) => {
      if(item.value) pluginConfig.push(this.metaFormData[index].name);
    });
    
    // format update object
    let updateObj = {
      formId:'plugins-pimp-form',
      formValidity:formValidity,
      plugins: pluginConfig
    };

    // send update
    this.updatePimpConfig.emit(updateObj);
  }

  private updateFormValues(plugins:string[]):void {
    const pluginsArray = <FormArray>this.pimpPluginsForm.controls['plugins'];

    this.availablePluginsPromise.then(availablePlugins => {
      // remove loader
      this.isLoadingAvailablePlugins = false;

      // process data
      this.metaFormData = this.processPluginsData(plugins, availablePlugins);

      // add pimp plugin form blocks (if needed)
      while (pluginsArray.length < this.metaFormData.length) { 
        pluginsArray.push(this.formBuilder.control(false)); 
      }

      // remove pimp plugin form blocks (if needed)
      while (pluginsArray.length > this.metaFormData.length) { pluginsArray.removeAt(0); }

      // setup data
      this.metaFormData.forEach((item, index) => {
        let pluginFormControl = <FormControl>pluginsArray.controls[index];
        if (item.applied !== pluginFormControl.value) { pluginFormControl.setValue(item.applied); };
      });
    });
  }

  private processPluginsData(pluginConfig:string[], availablePlugins:PmpPluginDescriptor[]):PluginFormData[] {
    let removeDuplicates = function(src:string[]):string[] {
      let a = src.concat();
      for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
      }

      return a;
    }
    let preResult = removeDuplicates(pluginConfig.concat(availablePlugins.map(pluginDescriptor => pluginDescriptor.packageName)));
    let result:PluginFormData[] = [];

    // compute values
    preResult.forEach(item => {
      let pluginDescriptorObj = availablePlugins.find(pluginDescriptor => (pluginDescriptor.packageName === item));
      let pluginFormData:PluginFormData = {
        name:item,
        description: (pluginDescriptorObj && pluginDescriptorObj.packageDescription) ? pluginDescriptorObj.packageDescription : 'not available',
        readme: (pluginDescriptorObj && pluginDescriptorObj.packageReadme) ? pluginDescriptorObj.packageReadme : 'not available',
        applied:(pluginConfig.indexOf(item) !== -1) ? true : false,
        available:(pluginDescriptorObj) ? true : false
      };

      result.push(pluginFormData);
    });

    // sort alphabetically (staples always first)
    result.sort((a, b) => {
      if(a.name === 'pmp-plugin-staples') return -1;
      if(b.name === 'pmp-plugin-staples') return 1;
      if(a.name < b.name) return -1;
      if(a.name > b.name) return 1;
      return 0;
    });

    return result;
  }

  private openDialog(pluginName):void {
    console.log(pluginName)
    this.dialogRef = this.dialog.open(PluginReadmeComponent);
  }

  ngOnDestroy() {
    this.killSubs.next(true);
  }
}
