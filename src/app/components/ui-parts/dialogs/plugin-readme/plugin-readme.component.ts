import { Component, OnInit } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { ConfigModelService } from '../../../../model/config-model.service';

@Component({
  selector: 'app-plugin-readme',
  template: `
    <div class="markdown-container" [innerHTML]="readmeContent|MarkdownToHtml"></div>
  `,
  styleUrls: ['./plugin-readme.component.scss']
})
export class PluginReadmeComponent implements OnInit {
  public pluginName:string;
  private readmeContent:string;

  constructor(public dialogRef: MdDialogRef<PluginReadmeComponent>, private configModel:ConfigModelService) {}

  ngOnInit() {
    // find & assign readme markdown content
    this.configModel.availablePluginsPromise.then(data => {
      this.readmeContent = data.find(item => item.packageName === this.pluginName).packageReadme;
    });
  }
}
