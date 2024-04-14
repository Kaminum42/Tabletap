const pickProperties = (obj: object, propertiesToPick: string[]): object => {  
    const result: object = {};
    for (const property of propertiesToPick) {
        if (obj.hasOwnProperty(property)) {
            // @ts-ignore
            result[property] = obj[property];
        }
    }
    return result;
}

export { pickProperties }