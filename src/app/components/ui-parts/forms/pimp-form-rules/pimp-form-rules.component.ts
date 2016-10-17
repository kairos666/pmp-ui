import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChildren } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PimpConfig, deconstructPimpConfig, PimpRule } from '../../../../schema/config';
import { PimpRuleInputComponent } from '../pimp-rule-input/pimp-rule-input.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-pimp-form-rules',
  templateUrl: './pimp-form-rules.component.html',
  styleUrls: ['./pimp-form-rules.component.scss']
})
export class PimpFormRulesComponent implements OnInit, OnDestroy {
  @Input() pimpConfigInit:Observable<PimpConfig>; //always send current config (no distinct)
  @Input() pimpConfigChanges:Observable<PimpConfig>; // only works when config change
  @Output() updatePimpConfig = new EventEmitter();
  @ViewChildren(PimpRuleInputComponent) allPimpRuleForms;
  private rules:any[];
  private rulesParams:any[];
  private killSubs = new Subject();

  constructor() { }

  ngOnInit() {
    //set initial paramters
    this.pimpConfigInit.first().subscribe(config => {
      let initRules = this.buildInitRulesObjectsFromConfig(config);
      this.rules = initRules.rules;
      this.rulesParams = initRules.rulesParams;

      //react to new config parameters incoming
      this.pimpConfigChanges.takeUntil(this.killSubs).subscribe(config => {
        // update params
        let tempRulesParams = [];
        deconstructPimpConfig(config)[4].forEach((item, index) => {
          let ruleItem = { rulePattern:item.url, modifs:item.modifs.join('\n') };
          tempRulesParams.push(ruleItem);
        });
        this.rulesParams = tempRulesParams;

        //add pimp rule form blocks (if needed)
        while (this.rulesParams.length > this.rules.length) { this.rules.push('someRuleToken'); }
        //remove pimp rule form blocks (if needed)
        while (this.rulesParams.length < this.rules.length) { this.rules.pop(); }
      });
    });
  }

  private onRuleUpdate(event?):void {
    switch(event.action) {
      case 'addition':
        // send update when view has been re-rendered
        this.allPimpRuleForms.changes.delay(0).first().subscribe(change => {
          this.updateUpstream();
        });

        // add rule block
        let ruleItem = { rulePattern:'', modifs:'' };
        this.rules.push('someRuleToken');
        this.rulesParams.push(ruleItem);
      break;

      case 'delete':
        // send update when view has been re-rendered
        this.allPimpRuleForms.changes.delay(0).first().subscribe(change => {
          this.updateUpstream();
        });

        // timeout 0 (async) is necessary to avoid strange refresh bug
        let sub = Observable.timer(0).subscribe(() => {
            this.rulesParams = this.rulesParams.filter((item, index) => (event.ruleIndex !== index));
            this.rules.pop();
          },
          undefined,
          () => { sub.unsubscribe(); }
        );
      break;

      case 'update':
        // changes inside an existing rule block
        this.updateUpstream();
      break;
    }
  }

  private updateUpstream() {
    // get all rules status
    let allPimpRulesStatus = [];
    this.allPimpRuleForms.toArray().forEach(pimpRule => {
      let status = (<PimpRuleInputComponent>pimpRule).ruleStatus();
      allPimpRulesStatus.push(status);
    });

    // format update object
    let updateObj = {
      formId:'rules-pimp-form',
      formValidity:true,
      pimpCmds: []
    };
    allPimpRulesStatus.forEach(status => {
      if(status.action !== 'delete') {
        //register this rule (else will ignore entry)
        updateObj.pimpCmds.push(new PimpRule(status.rule.url, [status.rule.modifs]));

        //check validity
        if(!status.ruleValidity) updateObj.formValidity = false;
      }
    });

    //send update
    this.updatePimpConfig.emit(updateObj);
  }

  private buildInitRulesObjectsFromConfig(config:PimpConfig):any {
    let inputPimpRules = deconstructPimpConfig(config)[4];
    let result = {
      rules:[],
      rulesParams:[]
    };

    //build all
    inputPimpRules.forEach((item, index) => {
      let ruleItem = { rulePattern:item.url, modifs:item.modifs.join('\n') };
      result.rules.push('someRuleToken');
      result.rulesParams.push(ruleItem);
    });

    return result;
  }

  ngOnDestroy() {
    this.killSubs.next(true);
  }
}
