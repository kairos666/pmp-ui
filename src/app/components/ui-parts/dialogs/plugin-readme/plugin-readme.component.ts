import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-plugin-readme',
  templateUrl: './plugin-readme.component.html',
  styleUrls: ['./plugin-readme.component.scss']
})
export class PluginReadmeComponent {

  constructor(public dialogRef: MdDialogRef<PluginReadmeComponent>) { }
}
