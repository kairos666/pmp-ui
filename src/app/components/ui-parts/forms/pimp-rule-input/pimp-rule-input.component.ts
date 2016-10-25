import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pimp-rule-input',
  templateUrl: './pimp-rule-input.component.html',
  styleUrls: ['./pimp-rule-input.component.scss']
})
export class PimpRuleInputComponent {
  @Input() formGroupName:number;
  @Input() rule:FormGroup;
  @Output() onClickDelete = new EventEmitter();

  constructor() { }

  private onRuleDelete() {
    this.onClickDelete.emit(true);
  }
}
