import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/empty';

@Injectable()
export class ErrorService {

    public showError(message: any, options?: {
        duration?: number
    }) {
        console.error(message, 'will be shown for', options && options.duration);
    }

    public showCommunicationError(response: any): Observable<null> {
        let message = response.message || response;
        if (response.error) {
            message += ' : ' + response.error;
        }
        this.showError(`Communication error: ${message}`, {
            duration: 60000,
        });
        return Observable.empty();
    }
}
