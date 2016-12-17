import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { PmpPluginDescriptor } from '../../../schema/config';
import { copyToClipboard } from '../../../utils/utils-functions';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-sidenav-rule-helper',
  templateUrl: './sidenav-rule-helper.component.html',
  styleUrls: ['./sidenav-rule-helper.component.scss']
})
export class SidenavRuleHelperComponent implements OnInit {
  @Input() availablePluginsStream:Observable<PmpPluginDescriptor[]>;
  private jsHelpers = [];
  private subs:Subscription;

  constructor() { }

  ngOnInit() {
    // process helpers
    this.subs = this.availablePluginsStream.subscribe(availablePlugins => {
      this.jsHelpers = [];
      availablePlugins.forEach(pluginDesc => {
        // build function descriptors
        let jsHelperDescs:jsHelperdescriptor[] = [];
        pluginDesc.packageJsHelpers.forEach(item => {
          let full = item;
          let replaceString = item.match(/(^helpers\.[^\.]*\.)/)[0];
          let short = item.replace(replaceString, '');
          let jsHelperDesc = <jsHelperdescriptor>{
            shortFunc: short,
            fullFunc: full
          };
          jsHelperDescs.push(jsHelperDesc);
        });

        let jsHelper = <jsHelperPluginDescriptor>{
          name: pluginDesc.packageName,
          helpers: jsHelperDescs
        };

        this.jsHelpers.push(jsHelper);

        // sort alphabetically (staples always first)
        this.jsHelpers.sort((a, b) => {
          if(a.name === 'pmp-plugin-staples') return -1;
          if(b.name === 'pmp-plugin-staples') return 1;
          if(a.name < b.name) return -1;
          if(a.name > b.name) return 1;
          return 0;
        });
      });
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private onClipboardCopy(evt) {
    copyToClipboard(evt);
  }
}

interface jsHelperdescriptor {
  shortFunc: string;
  fullFunc: string;
}

interface jsHelperPluginDescriptor {
  name: string;
  helpers: jsHelperdescriptor[];
}
