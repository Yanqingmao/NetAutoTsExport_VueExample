export namespace System {
    /** without remark  */
    // tslint:disable-next-line:interface-name
    export interface ValueType {
    }
    /** without remark  */
    export class ValueTypeImpl implements ValueType {
    }
    /** without remark  */
    // tslint:disable-next-line:interface-name
    export interface Void extends ValueType {
    }
    /** without remark  */
    export class VoidImpl extends ValueTypeImpl implements Void {
    }
}
export namespace TsGenAspnetExample.Models {
    /** without remark  */
    // tslint:disable-next-line:interface-name
    export interface Person {
        /** without remark  */
        Name: null | string;
    }
    /** without remark  */
    export class PersonImpl implements Person {
        /** without remark  */
        Name: null | string;
        /** without remark  */
        constructor() {
            this.Name = null;
        }
    }
}
