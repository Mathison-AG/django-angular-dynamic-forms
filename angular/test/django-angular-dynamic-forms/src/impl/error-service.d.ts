import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/empty';
export declare class ErrorService {
    show_error(message: any, options?: {
        duration?: number;
    }): void;
    show_communication_error(response: any): Observable<null>;
}
