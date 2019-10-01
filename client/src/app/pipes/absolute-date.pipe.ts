import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'absoluteDate' })
export class AbsoluteDatePipe implements PipeTransform {
    transform(dateString: string): string {
        if (!dateString) {
            return '';
        }

        return moment(dateString).format('YYYY-MM-DD HH:mm:ss');
    }
}
