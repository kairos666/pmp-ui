import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router }   from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PimpConfig, PimpRule } from '../../../schema/config';

@Component({
  selector: 'app-config-preview-tile',
  template: `
    <h3>
      <button type="button" class="btn-edit" (click)="onClickEdit()"><md-icon>mode_edit</md-icon></button>
      <span>Pimp rules</span>
    </h3>
    <ul *ngIf="rules.length !== 0" class="pimp-rules-tile-container item-list">
      <template ngFor let-rule let-i="index" [ngForOf]="rules">
        <li>
          <md-icon>invert_colors</md-icon>
          <h4>Rule #{{i + 1}}</h4>
          <p>{{rule.url}}</p>
        </li>
      </template>
    </ul>
    <ul class="no-data item-list" *ngIf="rules.length === 0">
      <li>
        <md-icon>not_interested</md-icon>
        <h4>No data</h4>
        <p>Only available when pimp engine is started and has some rules defined</p>
      </li>
    </ul>
  `,
})
export class ConfigPreviewTileComponent implements OnInit, OnDestroy {
  @Input() config:Observable<PimpConfig>;
  private rules:PimpRule[];
  private sub:Subscription;

  constructor(private router:Router) { }

  ngOnInit() {
    this.sub = this.config.subscribe(pimpRules => {
      if(pimpRules) {
        this.rules = pimpRules.pimpCmds;
      } else {
        this.rules = [];
      }
    });
  }

  private onClickEdit() {
    this.router.navigate(['/configuration', { selectedTabIndex: 1 }]);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
