

export class object_util {

    public static shallowEqual(object1:any, object2:any):boolean {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (let key of keys1) {
            if (object1[key] !== object2[key]) {
                return false;
            }
        }
        return true;
    }

    public static deepEqual(object1:any, object2:any):boolean {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (const key of keys1) {
            const val1 = object1[key];
            const val2 = object2[key];

            if(this.isArray(val1)){
                if(!this.isArray(val2)){
                    return false;
                }

                return this.deepEqual(val1, val2);
            }
            else if(this.isObject(val1)){
                if(!this.isObject(val2)){
                    return false;
                }

                return this.deepEqual(val1, val2);
            }

            if (val1 !== val2) {
                return false;
            }
        }
        return true;
    }

    public static isObject(object:any):boolean {
        return object != null && typeof object === 'object';
    }
    public static isArray(object:any):boolean {
        return object != null && Array.isArray(object);
    }
}