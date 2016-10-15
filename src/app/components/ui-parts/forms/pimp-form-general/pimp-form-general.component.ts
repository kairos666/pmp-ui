import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PimpConfig, deconstructPimpConfig } from '../../../../schema/config';
import { CustomValidators } from '../custom-validators';

@Component({
  selector: 'app-pimp-form-general',
  templateUrl: './pimp-form-general.component.html',
  styleUrls: ['./pimp-form-general.component.css']
})
export class PimpFormGeneralComponent implements OnInit, OnDestroy {
  @Input() pimpConfigInit:Observable<PimpConfig>; //always send current config (no distinct)
  @Input() pimpConfigChanges:Observable<PimpConfig>; // only works when config change
  @Output() updatePimpConfig = new EventEmitter();
  private generalPimpForm:FormGroup;
  private killSubs = new Subject();

  constructor(private formBuilder:FormBuilder) { }

  ngOnInit() {
    // create form model
    /* no validator for URL pattern because it is not possible */
    this.generalPimpForm = this.formBuilder.group({
      target: ['', Validators.required],
      port: ['', [Validators.required, CustomValidators.portRange]],
      cookies: true
    });

    //set initial paramters
    let initialParams:any[];
    this.pimpConfigInit.first().subscribe(config => {
      initialParams = deconstructPimpConfig(config);
      (<any>this.generalPimpForm.controls).target.setValue(initialParams[1]);
      (<any>this.generalPimpForm.controls).port.setValue(initialParams[3]);
      (<any>this.generalPimpForm.controls).cookies.setValue(initialParams[2]);

      //setup form update (no submit)
      this.formUpdateSetup();
    });
  }

  private formUpdateSetup():void {
    // handle form changes (take in only valid inputs)
    this.generalPimpForm.valueChanges.takeUntil(this.killSubs)
      .debounceTime(200) /* to avoid too many consecutive calls */
      .filter(() => this.generalPimpForm.valid)
      .subscribe(formValues => {
        this.updatePimpConfig.emit(formValues);
      });

    //react to new config parameters incoming
    let updateParams:any[];
    this.pimpConfigChanges.takeUntil(this.killSubs).subscribe(config => {
      updateParams = deconstructPimpConfig(config);
      let targetFormControl   = (<any>this.generalPimpForm.controls).target;
      let portFormControl     = (<any>this.generalPimpForm.controls).port;
      let cookiesFormControl  = (<any>this.generalPimpForm.controls).cookies;
      if (updateParams[1] !== targetFormControl.value) { console.log('change target: ' + targetFormControl.value); targetFormControl.setValue(updateParams[1]); };
      if (updateParams[3] !== portFormControl.value) { console.log('change port: ' + targetFormControl.value); portFormControl.setValue(updateParams[3]); };
      if (updateParams[2] !== cookiesFormControl.value) { console.log('change cookies: ' + targetFormControl.value); cookiesFormControl.setValue(updateParams[2]); };
    });
  }

  ngOnDestroy() {
    this.killSubs.next(true);
  }
}
