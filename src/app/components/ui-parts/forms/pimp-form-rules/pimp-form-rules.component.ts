import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { PimpConfig, deconstructPimpConfig, PimpRule } from '../../../../schema/config';

@Component({
  selector: 'app-pimp-form-rules',
  templateUrl: './pimp-form-rules.component.html',
  styleUrls: ['./pimp-form-rules.component.scss']
})
export class PimpFormRulesComponent implements OnInit, OnDestroy {
  @Input() pimpConfigInit:Observable<PimpConfig>; // always send current config (no distinct)
  @Input() pimpConfigChanges:Observable<PimpConfig>; // only works when config change
  @Output() updatePimpConfig = new EventEmitter();
  private pimpRulesForm:FormGroup;
  private killSubs = new Subject();

  constructor(private formBuilder:FormBuilder) { }

  ngOnInit() {
    // create initial form model
    /* no validator for URL pattern because it is not possible */
    this.pimpRulesForm = this.formBuilder.group({
      rules: this.formBuilder.array([]
    )});

    // handle form updates
    this.pimpRulesForm.valueChanges.takeUntil(this.killSubs)
      .debounceTime(200) /* to avoid too many consecutive calls & allow time for typing */
      .subscribe(rules => {
        this.updateUpstream();
      });

    // update initial paramters
    this.pimpConfigInit.first().subscribe(firstConfig => {
      let firstRules = this.buildInitRulesObjectsFromConfig(firstConfig);
      this.updateFormValues(firstRules);

      // react to new config parameters incoming
      this.pimpConfigChanges.takeUntil(this.killSubs).subscribe(newConfig => {
        // update params
        let newRules = this.buildInitRulesObjectsFromConfig(newConfig);
        this.updateFormValues(newRules);
      });
    });
  }

  private initRuleFormGroup(data?:PimpRule):FormGroup {
    let ruleSet:FormGroup;

    if (data) {
      // apply rule default values
      ruleSet = this.formBuilder.group({
        rulePattern: [(<any>data).url, Validators.required],
        modifs: [(<any>data).modifs, Validators.required]
      });
    } else {
      // empty rule set
      ruleSet = this.formBuilder.group({
        rulePattern: ['', Validators.required],
        modifs: ['', Validators.required]
      });
    }

    return ruleSet;
  }

  private onRuleAdd():void {
    const rulesArray = <FormArray>this.pimpRulesForm.controls['rules'];
    rulesArray.push(this.initRuleFormGroup());
  }

  private onRuleDelete(index:number):void {
    const rulesArray = <FormArray>this.pimpRulesForm.controls['rules'];
    rulesArray.removeAt(index);
  }

  private updateUpstream():void {
    // fill pimp rules current values
    const rulesArray = <FormArray>this.pimpRulesForm.controls['rules'];
    const formValidity = rulesArray.valid;
    const formRawValues = rulesArray.value;

    // convert raw to PimpRules
    const pimpRulesArray = formRawValues.map(item => new PimpRule(item.rulePattern, [item.modifs]));

    // format update object
    let updateObj = {
      formId:'rules-pimp-form',
      formValidity:formValidity,
      pimpCmds: pimpRulesArray
    };

    // send update
    this.updatePimpConfig.emit(updateObj);
  }

  private buildInitRulesObjectsFromConfig(config:PimpConfig):any {
    let inputPimpRules = deconstructPimpConfig(config)[5];
    let result = [];
    
    // build all
    inputPimpRules.forEach((item, index) => {
      let ruleItem = { rulePattern:item.url, modifs:item.modifs.join('\n') };
      result.push(ruleItem);
    });

    return result;
  }

  private updateFormValues(rules:any[]):void {
    const rulesArray = <FormArray>this.pimpRulesForm.controls['rules'];

    // add pimp rule form blocks (if needed)
    while (rulesArray.length < rules.length) { rulesArray.push(this.initRuleFormGroup()); }

    // remove pimp rule form blocks (if needed)
    while (rulesArray.length > rules.length) { rulesArray.removeAt(0); }

    // update pimp rule blocks (if needed)
    rules.forEach((item, index) => {
      const ruleGroup                 = <FormGroup>rulesArray.controls[index];
      const rulePatternFormControl    = <FormControl>ruleGroup.controls['rulePattern'];
      const modifsFormControl         = <FormControl>ruleGroup.controls['modifs'];
      if (item.rulePattern !== rulePatternFormControl.value) { rulePatternFormControl.setValue(item.rulePattern); };
      if (item.modifs !== modifsFormControl.value) { modifsFormControl.setValue(item.modifs); };
    });
  }

  ngOnDestroy() {
    this.killSubs.next(true);
  }
}
