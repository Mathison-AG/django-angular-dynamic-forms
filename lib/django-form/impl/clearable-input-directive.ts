import {
    AfterViewChecked, Directive, ElementRef, forwardRef, Host, HostListener, Inject, Injector,
    ViewContainerRef
} from '@angular/core';
import * as $ from 'jquery';

import {DjangoFormContentComponent} from './django-form-content.component';

@Directive({
    selector: '[clearableInputs]'
})
export class ClearableInputDirective implements AfterViewChecked {

    inputs: any = $('totally-non-existing-element');

    constructor(private el: ElementRef,
                @Inject(forwardRef(() => DjangoFormContentComponent)) private _parent: DjangoFormContentComponent) {
    }

    ngAfterViewChecked(): void {
        const inputs = $(this.el.nativeElement).find('input[type=text],input[type=number],input[type=date]');
        if (inputs.length != this.inputs.length) {
            this.inputs = inputs;
            for (let input of (inputs as any)) {
                if ($(input).data('clear-button')) {
                    continue;
                }
                const clear_button = $(input).before('<span class="input-clear"><i class="material-icons">clear</i></span>');
                $(input).data('clear-button', clear_button);
            }
        }
    }

    @HostListener('click', ['$event'])
    click(event) {
        const input = $(event.target).closest('.input-clear').next();
        input.val('');
        if (this._parent['clear_autocompleters']) {
            this._parent.clear_autocompleters();
        }
    }

}
