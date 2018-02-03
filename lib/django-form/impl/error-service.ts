import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class ErrorService {

    show_error(message, options?: {
        duration?: number
    }) {
        console.error(message);
    }

    show_communication_error(response) : Observable<null> {
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
