import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { PimpConfig } from '../../../../schema/config';

@Component({
  selector: 'app-pimp-form-plugins',
  templateUrl: './pimp-form-plugins.component.html',
  styleUrls: ['./pimp-form-plugins.component.scss']
})
export class PimpFormPluginsComponent implements OnInit, OnDestroy {
  @Input() pimpConfigInit:Observable<PimpConfig>; // always send current config (no distinct)
  @Input() pimpConfigChanges:Observable<PimpConfig>; // only works when config change
  @Output() updatePimpConfig = new EventEmitter();
  private pimpPluginsForm:FormGroup;
  private killSubs = new Subject();

  constructor(private formBuilder:FormBuilder) { }

  ngOnInit() {
    // create initial form model
    this.pimpPluginsForm = this.formBuilder.group({
      plugins: this.formBuilder.array([])
    });

    // handle form updates
    this.pimpPluginsForm.valueChanges.takeUntil(this.killSubs)
      .debounceTime(200) /* to avoid too many consecutive calls */
      .subscribe(plugins => {
        this.updateUpstream();
      });

    // update initial paramters
    this.pimpConfigInit.first().subscribe(firstConfig => {
      this.updateFormValues(firstConfig.plugins);

      // react to new config parameters incoming
      this.pimpConfigChanges.takeUntil(this.killSubs).subscribe(newConfig => {
        // update params
        this.updateFormValues(newConfig.plugins);
      });
    });
  }

  private updateUpstream():void {
    console.log('UPDATE DETECTED');
  }

  private updateFormValues(plugins:string[]):void {
    console.log(plugins);
  }

  ngOnDestroy() {
    this.killSubs.next(true);
  }
}
