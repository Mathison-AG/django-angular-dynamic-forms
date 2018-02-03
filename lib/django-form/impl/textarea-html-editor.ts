import {
    AfterViewChecked, AfterViewInit, Directive, ElementRef, Input, OnDestroy, QueryList,
    ViewChildren
} from '@angular/core';
// import $ from 'jquery';

// declare var CKEDITOR: any;

@Directive({
    selector: '[addHtmlEditors]'
})
export class AddHtmlEditorsDirective implements AfterViewChecked, OnDestroy {
    @Input()
    htmlEditorsSelector = 'textarea';

    @ViewChildren('textarea') textAreaChildren: QueryList<any>;

    // editors: any = $('totally-non-existing-element');

    constructor(private el: ElementRef) {
    }

    ngAfterViewChecked(): void {
        return;
        /*
        setTimeout(() => {
            const editors = $(this.el.nativeElement).find(this.htmlEditorsSelector);
            if (editors.length != this.editors.length) {
                this.editors = editors;
                for (let editor of editors) {
                    if ($(editor).data('ckeditor')) {
                        continue;
                    }
                    $(editor).data('ckeditor', true);
                    CKEDITOR.replace(editor, {
                        format_tags: 'p;h2;h3;pre'
                    });
                    $(editor).parent().parent().next().hide();
                    $(editor).closest('mat-form-field').addClass('mat-form-field-should-float');
                }
                for (let i in CKEDITOR.instances) {
                    CKEDITOR.instances[i].on('keyUp', function () {
                        CKEDITOR.instances[i].updateElement();
                    });
                    CKEDITOR.instances[i].on('change', function () {
                        CKEDITOR.instances[i].updateElement();
                    });
                }
            }
        }, 500);
        */
    }

    ngOnDestroy() {
        // for (let editor of this.editors) {
        //     $(editor).removeData('ckeditor');
        // }
        // for (let i in CKEDITOR.instances) {
        //     CKEDITOR.instances[i].on('change', function () {
        //         CKEDITOR.instances[i].destroy();
        //     });
        // }
   }
}
