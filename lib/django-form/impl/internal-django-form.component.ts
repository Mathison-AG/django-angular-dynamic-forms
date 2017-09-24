import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {FormGroup} from '@angular/forms';

import {DynamicFormControlModel} from '@ng-dynamic-forms/core';
import {DynamicFormService} from '@ng-dynamic-forms/core/src/service/dynamic-form.service';
import {DynamicInputModel} from '@ng-dynamic-forms/core/src/model/input/dynamic-input.model';
import {DynamicFormGroupModel} from '@ng-dynamic-forms/core/src/model/form-group/dynamic-form-group.model';

/**
 * Form component targeted on django rest framework
 */
@Component({
  selector: 'internal-django-form-component',
  templateUrl: './internal-django-form.component.html',
  styleUrls: ['./internal-django-form.component.scss'],
})
export class InternalDjangoFormComponent implements OnInit {
  formModel: DynamicFormControlModel[] = [];
  formGroup: FormGroup;
  private last_id = 0;

  /**
   * Returns submitted form data
   *
   * @type {EventEmitter<any>}
   */
  @Output()
  submit = new EventEmitter();

  @Input()
  set config(_config: any) {
    const controls = this._generate_ui_control_array(_config.widgets);
    this.formModel.push(...controls);

    if (this.formGroup) {
      this.formService.addFormGroupControl(this.formGroup, controls);
    }
  }

  constructor(private formService: DynamicFormService) {
  }

  ngOnInit() {
    this.formGroup = this.formService.createFormGroup(this.formModel);
  }

  private onSubmit() {
    const value = this.formGroup.value;
    this._flatten(null, value, null);
    this.submit.emit(value);
  }

  private _flatten(name, current, parent) {
    if (current !== Object(current)) {
      return;
    }
    for (const k of Object.getOwnPropertyNames(current)) {
      const val = current[k];
      this._flatten(k, val, current);
    }
    if (name && name.startsWith('generated_')) {
      for (const k of Object.getOwnPropertyNames(current)) {
        parent[k] = current[k];
      }
      delete parent[name];
    }
  }

  private _generate_ui_control_array(configs: any[]): DynamicFormControlModel[] {
    const model: DynamicFormControlModel[] = [];
    for (const config of configs) {
      model.push(this._generate_ui_control(config));
    }
    return model;
  }

  private _generate_ui_control(config: any): DynamicFormControlModel {
    let id: string;
    let type: string;
    let label: string;
    let controls: any[];

    const config_is_array = Array.isArray(config);

    if (config_is_array) {
      if (config.find(x => Array.isArray(x))) {
        type = 'fieldset';
        if (typeof config[0] === 'string') {
          label = config[0];
          controls = config.slice(1);
        } else {
          controls = config;
        }
      } else {
        id = config[0];
        label = config[1];
        type = config[2];
      }
    } else {
      id = config.id;
      label = config.label;
      type = config.type;
      controls = config.controls;
    }
    if (label === undefined) {
      label = '';
    }
    if (type === undefined) {
      type = 'char';
    }
    if (type === 'char') {
      return new DynamicInputModel({
        id: id,
        placeholder: label
      });
    } else if (type === 'fieldset') {
      return new DynamicFormGroupModel({
        id: 'generated_' + (this.last_id++),
        legend: label,
        group: this._generate_ui_control_array(controls)
      });
    } else {
      throw new Error(`No ui control model for ${type}`);
    }
  }
}
