import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { PimpRule } from '../../../../schema/config';

@Component({
  selector: 'app-pimp-rule-input',
  templateUrl: './pimp-rule-input.component.html',
  styleUrls: ['./pimp-rule-input.component.css']
})
export class PimpRuleInputComponent implements OnInit, OnDestroy, OnChanges {
  @Input() ruleIndex:number;
  @Input() ruleData:any;
  @Output() onRuleUpdate = new EventEmitter();
  private rulePimpForm:FormGroup;
  private killSubs = new Subject();

  constructor(private formBuilder:FormBuilder) { }

  ngOnInit() {
    // create form model
    /* no validator for URL pattern because it is not possible */
    this.rulePimpForm = this.formBuilder.group({
      rulePattern: [this.ruleData.rulePattern, Validators.required],
      modifs: [this.ruleData.modifs, Validators.required]
    });

    //setup form update (no submit)
    this.formUpdateSetup();
  }

  ngOnChanges() {
    if (this.rulePimpForm) {
      let rulePatternFormControl   = (<any>this.rulePimpForm.controls).rulePattern;
      let modifsFormControl   = (<any>this.rulePimpForm.controls).modifs;
      if (this.ruleData.rulePattern !== rulePatternFormControl.value) { rulePatternFormControl.setValue(this.ruleData.rulePattern); };
      if (this.ruleData.modifs !== modifsFormControl.value) { modifsFormControl.setValue(this.ruleData.modifs); };
    }
  }

  private formUpdateSetup():void {
    // handle form changes (take in only valid inputs)
    this.rulePimpForm.valueChanges.takeUntil(this.killSubs)
      .debounceTime(200) /* to avoid too many consecutive calls & allow time for typing */
      .subscribe(formValues => {
        let ruleStateChange = this.ruleStatus();
        ruleStateChange.action = 'update';

        this.onRuleUpdate.emit(ruleStateChange);
      });
  }

  private onDeleteRule():void {
    let ruleStateChange = this.ruleStatus();
    ruleStateChange.action = 'delete';

    this.onRuleUpdate.emit(ruleStateChange);
  }

  public ruleStatus():RuleStatus {
    return {
      ruleValidity: this.rulePimpForm.valid,
      rule:new PimpRule(this.rulePimpForm.value.rulePattern, this.rulePimpForm.value.modifs),
      ruleIndex:this.ruleIndex,
      action:'request'
    }
  }

  ngOnDestroy() {
    this.killSubs.next(true);
  }
}

export interface RuleStatus {
  ruleValidity:boolean;
  rule:PimpRule;
  ruleIndex:number;
  action:string;
}
