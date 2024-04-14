import { BadRequestError } from 'routing-controllers';
import { isEmpty } from 'class-validator';

// [
//     {
//         "field": [
//             "grandfather",
//             "father",
//             "son",
//             "grandson"
//         ],
//         "order": "asc"
//     }
// ]

export const parse = (sort: string): { full_field: string, field: string[], order: 'asc' | 'desc' }[] => {
    const sortExps = sort.split(',');
    const sortArr = [];
    for (const sortExp of sortExps) {
        if(isEmpty(sortExp)) {
            throw new BadRequestError('Invalid sort.');
        }
        const [full_field, order] = sortExp.split('|');
        // check split success?
        if(isEmpty(full_field) || isEmpty(order) || ['asc', 'desc'].includes(order) === false) {
            throw new BadRequestError('Invalid sort.');
        }
        sortArr.push({
            full_field,
            field: [] as string[],
            order: order as 'asc' | 'desc'
        });
        const part = full_field.split('.');

        for(const p of part) {
            if(!p.match(/^[a-zA-Z0-9_-]+$/)) {
                throw new BadRequestError('Invalid sort.');
            }
            sortArr[sortArr.length - 1].field.push(p);
        }
    }

    return sortArr;
}
