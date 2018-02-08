import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/empty';

@Injectable()
export class ErrorService {

    show_error(message: any, options?: {
        duration?: number
    }) {
        console.error(message, 'will be shown for', options && options.duration);
    }

    show_communication_error(response: any): Observable<null> {
        let message = response.message || response;
        if (response.error) {
            message += ' : ' + response.error;
        }
        this.show_error(`Communication error: ${message}`, {
            duration: 60000,
        });
        return Observable.empty();
    }
}
