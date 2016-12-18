import { Component, OnInit, OnDestroy } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { ConfigModelService } from '../../../../model/config-model.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-plugin-readme',
  template: `
    <div class="markdown-container" [innerHTML]="readmeContent|MarkdownToHtml"></div>
  `
})
export class PluginReadmeComponent implements OnInit {
  public pluginName:string;
  private readmeContent:string;
  private subs:Subscription;

  constructor(public dialogRef: MdDialogRef<PluginReadmeComponent>, private configModel:ConfigModelService) {}

  ngOnInit() {
    // find & assign readme markdown content
    this.subs = this.configModel.availablePlugins$
      .map(data => data.find(item => item.packageName === this.pluginName).packageReadme)
      .subscribe(data => {
        this.readmeContent = data;
      });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
