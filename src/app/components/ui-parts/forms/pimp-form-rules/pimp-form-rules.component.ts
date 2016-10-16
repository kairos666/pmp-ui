import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChildren } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PimpConfig, deconstructPimpConfig, PimpRule } from '../../../../schema/config';
import { PimpRuleInputComponent } from '../pimp-rule-input/pimp-rule-input.component';
import * as _ from 'lodash';

const ruleTitlePrefix = 'Rule N°';

@Component({
  selector: 'app-pimp-form-rules',
  templateUrl: './pimp-form-rules.component.html',
  styleUrls: ['./pimp-form-rules.component.css']
})
export class PimpFormRulesComponent implements OnInit, OnDestroy {
  @Input() pimpConfigInit:Observable<PimpConfig>; //always send current config (no distinct)
  @Input() pimpConfigChanges:Observable<PimpConfig>; // only works when config change
  @Output() updatePimpConfig = new EventEmitter();
  @ViewChildren(PimpRuleInputComponent) allPimpRuleForms;
  private rules:any[];
  private needAfterViewCheckUpdating = false;
  private killSubs = new Subject();

  constructor() { }

  ngOnInit() {
    //set initial paramters
    this.pimpConfigInit.first().subscribe(config => {
      this.rules = this.buildInitRulesObjectsFromConfig(config);

      //react to new config parameters incoming
      this.pimpConfigChanges.takeUntil(this.killSubs).subscribe(config => {
        
      });
    });
  }

  private buildInitRulesObjectsFromConfig(config:PimpConfig):any[] {
    let inputPimpRules = deconstructPimpConfig(config)[4];
    let result = [];

    //build all
    inputPimpRules.forEach((item, index) => {
      let ruleItem = { title:ruleTitlePrefix + (index + 1), rulePattern:item.url, modifs:item.modifs.join('\n') };
      result.push(ruleItem)
    });

    return result;
  }

  private onRuleUpdate(event?):void {
    // get all rules status
    let allPimpRulesStatus = [];
    this.allPimpRuleForms.toArray().forEach(pimpRule => {
      let status = (<PimpRuleInputComponent>pimpRule).ruleStatus();
      
      //use received event if event ID is matching
      if (event && event.ruleIndex === status.ruleIndex) {
        status = event;
      }

      allPimpRulesStatus.push(status);
    });

    // handle addition of rule
    if (!event) {
      let addedRuleStatus = {
        ruleValidity: false,
        rule:new PimpRule('', ['']),
        ruleIndex:allPimpRulesStatus.length,
        action:'addition'
      };
      allPimpRulesStatus.push(addedRuleStatus);
    }

    //resolve actions
    this.resolveUpdates(allPimpRulesStatus);
  }

  private resolveUpdates(commands:any[]):any[] {
    let rulesClone = this.rules.slice(0);

    // handle deletion
    commands.filter(item => (item.action === 'delete')).forEach(item => {
      delete rulesClone[item.ruleIndex];
    });

    // handle addition
    commands.filter(item => (item.action === 'addition')).forEach(item => {
      rulesClone[item.ruleIndex] = { title:'', rulePattern:item.rule.url, modifs:item.rule.modifs };
    });

    // handle update
    commands.filter(item => (item.action === 'update')).forEach(item => {
      rulesClone[item.ruleIndex] = { title:'', rulePattern:item.rule.url, modifs:item.rule.modifs };
    });

    // clean deleted items
    rulesClone = rulesClone.filter(item => (item));

    // reset titles
    rulesClone.map((item, index) => {
      item.title = ruleTitlePrefix + (index + 1);
    });

    // check overall validity
    // send update
  }

  ngOnDestroy() {
    this.killSubs.next(true);
  }
}

// private addEmptyRule():void {
//     let AddedEmptyRule = {
//       title:ruleTitlePrefix + (this.rules.length + 1),
//       rulePattern:'',
//       modifs:''
//     };
//     this.rules.push(AddedEmptyRule);
//   }

//   private onRuleUpdate(event?):void {
//     // get all rules status
//     let allPimpRulesStatus = [];
//     this.allPimpRuleForms.toArray().forEach(pimpRule => {
//       let status = (<PimpRuleInputComponent>pimpRule).ruleStatus();
      
//       //use received event if event ID is matching
//       if (event && event.ruleIndex === status.ruleIndex) {
//         status = event;
//       }

//       allPimpRulesStatus.push(status);
//     });

//     // handle addition of rule
//     if (!event) {
//       let addedRuleStatus = {
//         ruleValidity: false,
//         rule:new PimpRule('', ['']),
//         ruleIndex:allPimpRulesStatus.length,
//         action:'addition'
//       };
//       allPimpRulesStatus.push(addedRuleStatus);
//       this.addEmptyRule();
//     }

//     //resolve actions
//     let resolvedPimpRulesUpdate = this.resolveActionsAndOutputUpdate(allPimpRulesStatus);

//     //send update
//     this.updatePimpConfig.emit(resolvedPimpRulesUpdate);
//   }

//   private buildRulesObjectFromConfig(config:PimpConfig):any[] {
//     let inputPimpRules = deconstructPimpConfig(config)[4];
//     let result = [];

//     //build all
//     inputPimpRules.forEach((item, index) => {
//       let ruleItem = { title:ruleTitlePrefix + (index + 1), rulePattern:item.url, modifs:item.modifs.join('\n') };
//       result.push(ruleItem)
//     });

//     return result;
//   }

//   private resolveActionsAndOutputUpdate(pimpRulesStatus:any[]):any {
//     let result = {
//       formId:'rules-pimp-form',
//       formValidity:true,
//       pimpCmds: []
//     };
//     pimpRulesStatus.forEach(status => {
//       if(status.action !== 'delete') {
//         //register this rule (else will ignore entry)
//         result.pimpCmds.push(new PimpRule(status.rule.url, [status.rule.modifs]));

//         //check validity
//         if(!status.ruleValidity) result.formValidity = false;
//       }
//     });

//     return result;
//   }
