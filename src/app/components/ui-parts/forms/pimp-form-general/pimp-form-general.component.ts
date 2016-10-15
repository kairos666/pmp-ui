import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PimpConfig, deconstructPimpConfig } from '../../../../schema/config';
import { CustomValidators } from '../custom-validators';

const matchUrl:string = '([-a-zA-Z0-9:%_\+.~#?&//=]*)';

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
  private sub:Subscription;

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
    });

    // handle form changes
    this.sub = this.generalPimpForm.valueChanges.subscribe(formValues => {
      console.log(formValues);
      console.log(this.generalPimpForm.valid);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
