import { Component, Input, OnInit } from '@angular/core';
import { Router }   from '@angular/router';
import { Observable } from 'rxjs';
import { PimpConfig, PimpRule } from '../../../schema/config';

@Component({
  selector: 'app-config-preview-tile',
  template: `
    <h3>
      <button type="button" class="btn-edit" (click)="onClickEdit()"><md-icon>mode_edit</md-icon></button>
      <span>Pimp rules</span>
    </h3>
    <ul class="pimp-rules-tile-container item-list">
      <li *ngFor="let i = index; let rule of pimpRulesStream | async">
        <md-icon>invert_colors</md-icon>
        <h4>Rule #{{i + 1}}</h4>
        <p>{{rule.url}}</p>
      </li>
    </ul>
  `,
})
export class ConfigPreviewTileComponent implements OnInit {
  @Input() config:Observable<PimpConfig>;
  private pimpRulesStream:Observable<PimpRule[]>;

  constructor(private router:Router) { }

  ngOnInit() {
    this.pimpRulesStream = this.config.map(config => config.pimpCmds);
  }

  private onClickEdit() {
    this.router.navigate(['/configuration']);
  }
}
