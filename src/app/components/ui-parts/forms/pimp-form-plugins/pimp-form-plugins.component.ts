import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { PimpConfig } from '../../../../schema/config';
import { PluginFormData } from '../../../../schema/pimp-form-plugin-data';

@Component({
  selector: 'app-pimp-form-plugins',
  templateUrl: './pimp-form-plugins.component.html',
  styleUrls: ['./pimp-form-plugins.component.scss']
})
export class PimpFormPluginsComponent implements OnInit, OnDestroy {
  @Input() pimpConfigInit:Observable<PimpConfig>; // always send current config (no distinct)
  @Input() pimpConfigChanges:Observable<PimpConfig>; // only works when config change
  @Input() availablePluginsPromise:Promise<string[]>;
  @Output() updatePimpConfig = new EventEmitter();
  private pimpPluginsForm:FormGroup;
  private killSubs = new Subject();

  constructor(private formBuilder:FormBuilder) { }

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
    console.log('UPDATE DETECTED');
  }

  private updateFormValues(plugins:string[]):void {
    this.availablePluginsPromise.then(availablePlugins => {
      let formStateData = this.processPluginsData(plugins, availablePlugins);

      console.log(formStateData);
    });
  }

  private processPluginsData(pluginConfig:string[], availablePlugins:string[]):PluginFormData[] {
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
    let preResult = removeDuplicates(pluginConfig.concat(availablePlugins));
    let result:PluginFormData[] = [];

    // compute values
    preResult.forEach(item => {
      let pluginFormData:PluginFormData = {
        name:item,
        applied:(pluginConfig.indexOf(item) !== -1) ? true : false,
        available:(availablePlugins.indexOf(item) !== -1) ? true : false
      };

      result.push(pluginFormData);
    });

    return result;
  }

  ngOnDestroy() {
    this.killSubs.next(true);
  }
}
