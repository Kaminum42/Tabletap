import { readFileSync } from 'fs';
import { join } from 'path';

export const readVersion = (): Record<string, unknown> => {
    const rawData = readFileSync(join(__dirname, 'version.json'), 'utf8')
    return JSON.parse(rawData);
};