import {
  Component, ComponentFactoryResolver, ComponentRef, EventEmitter, Input, OnInit, Output, ViewChild,
  ViewContainerRef
} from '@angular/core';

import {FormGroup} from '@angular/forms';

import {DynamicFormControlModel} from '@ng-dynamic-forms/core';
import {DynamicFormService} from '@ng-dynamic-forms/core/src/service/dynamic-form.service';
import {DynamicInputModel} from '@ng-dynamic-forms/core/src/model/input/dynamic-input.model';
import {DynamicFormGroupModel} from '@ng-dynamic-forms/core/src/model/form-group/dynamic-form-group.model';
import {InternalDjangoFormComponent} from './impl/internal-django-form.component';
import {Http} from '@angular/http';

/**
 * Form component targeted on django rest framework
 */
@Component({
  selector: 'django-form-component',
  templateUrl: './django-form.component.html',
  styleUrls: ['./django-form.component.scss'],
})
export class DjangoFormComponent implements OnInit {
  private _config: any;
  private _django_url: any;
  private loading = true;
  private data: any;

  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) target: ViewContainerRef;
  private _internal_form: ComponentRef<InternalDjangoFormComponent>;

  @Input()
  set config(_config: any) {
    this._config = _config;
  }

  @Input()
  set django_url(_url: string) {
    this._django_url = _url;
    this.http.get(this._django_url).subscribe(response => {
      console.log("Response", response);
    });
  }

  constructor(private resolver: ComponentFactoryResolver, private http: Http) {
  }

  ngOnInit(): void {
    this._create_form();
  }


  private _create_form() {
    this.target.clear();
    if (this._internal_form) {
      this._internal_form.destroy();
    }
    const childComponent = this.resolver.resolveComponentFactory(InternalDjangoFormComponent);
    this._internal_form = this.target.createComponent(childComponent);
    this._internal_form.instance.config = this._config;
    this._internal_form.instance.submit.subscribe(this.submitted);
  }

  private submitted(data) {
    console.log(data);
  }
}
