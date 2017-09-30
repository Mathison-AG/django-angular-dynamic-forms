import {Injectable} from '@angular/core';

@Injectable()
export class InterpolationService {

    constructor() {
    }

    public interpolate(text: string, parameters: any): string {
        const re = /{{(.*?)}}/;
        const pieces: string[] = [];
        while (true) {
            const match = re.exec(text);
            if (!match) {
                pieces.push(text);
                break;
            }
            pieces.push(text.slice(0, match.index));
            const propname = match[1];
            pieces.push(parameters[propname]);
            text = text.slice(match.index + match[0].length, text.length);
        }
        console.log('matches', pieces);
        return pieces.join('');
    }
}
