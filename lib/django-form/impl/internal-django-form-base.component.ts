import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

/**
 * Form component targeted on django rest framework
 */
@Component({
    selector: 'internal-django-form-base',
    template: ''
})
export class InternalDjangoFormBaseComponent implements OnInit {
    actions: any;

    @Input()
    form_title: string;

    /**
     * Returns submitted form data
     *
     * @type {EventEmitter<any>}
     */
    @Output()
    submit = new EventEmitter();

    /**
     * Returns cancelled form data
     *
     * @type {EventEmitter<any>}
     */
    @Output()
    cancel = new EventEmitter();

    private _config: any;

    @Input()
    set config(_config: any) {
        this._config = _config;
        if (_config) {
            this.actions = InternalDjangoFormBaseComponent._generate_actions(_config.actions);
        }
    }
    get config() {
        return this._config;
    }

    @Input()
    errors = null;

    @Input()
    initial_data = null;

    @ViewChild('form') form;


    static _generate_actions(actions) {
        const ret = [];
        if (actions) {
            for (const action of actions) {
                let action_id;
                let action_label;
                let action_cancel = false;
                let action_color = 'primary';

                if (Array.isArray(action)) {
                    action_id = action[0];
                    action_label = action[1];
                    if (action_label === undefined) {
                        action_label = action_id;
                    }
                } else if (Object(action) !== action) {
                    action_id = action_label = action;
                } else {
                    action_id = action.id;
                    action_label = action.label;
                    action_cancel = action.cancel;
                    if (action.color) {
                        action_color = action.color;
                    }
                }
                ret.push({
                    'id': action_id,
                    'label': action_label,
                    'color': action_color,
                    'cancel': action.cancel
                });
            }
        }
        return ret;
    }

    constructor() {
    }

    ngOnInit() {
    }

    private onSubmit(button_id, is_cancel) {
        // clone the value so that button clicks are not remembered
        console.log('value', this.form.value);
        const value = Object.assign({}, this.form.value);
        this._flatten(null, value, null);
        if (button_id) {
            value[button_id] = true;
        }
        if (is_cancel) {
            this.cancel.emit(value);
        } else {
            this.submit.emit(value);
        }
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
}
