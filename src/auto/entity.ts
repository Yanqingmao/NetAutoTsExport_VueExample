export namespace System {
    /** without remark  */
    // tslint:disable-next-line:class-name & interface-name
    export interface ValueType {
    }
    /** without remark  */
    export  abstract  class ValueTypeImpl implements ValueType {
    }
    /** without remark  */
    // tslint:disable-next-line:class-name & interface-name
    export interface Enum extends ValueType {
    }
    /** without remark  */
    export  abstract  class EnumImpl extends ValueTypeImpl implements Enum {
    }
    /** without remark  */
    // tslint:disable-next-line:class-name & interface-name
    export interface Void extends ValueType {
    }
    /** without remark  */
    export  class VoidImpl extends ValueTypeImpl implements Void {
    }
}
export namespace TsGenAspnetExample.Models {
    /** without remark  */
    // tslint:disable-next-line:class-name & interface-name
    export interface Animal {
        /** without remark  */
        AnimalType: EnumAnimalType;
        /** without remark  */
        Name: null | string;
    }
    /** without remark  */
    export  abstract  class AnimalImpl implements Animal {
        /** without remark  */
        AnimalType: EnumAnimalType;
        /** without remark  */
        Name: null | string;
        /** without remark  */
        constructor() {
            this.AnimalType = EnumAnimalType.Dog;
            this.Name = "";
        }
    }
    /** without remark  */
    export enum EnumAnimalType {
        /** without remark  */
        Dog = 0,
        /** without remark  */
        Cat = 1,
    }
    /** without remark  */
    // tslint:disable-next-line:class-name & interface-name
    export interface Cat extends Animal {
    }
    /** without remark  */
    export  class CatImpl extends AnimalImpl implements Cat {
        /** without remark  */
        constructor() {
            super();
            // if (!this) return; // sometime jquery.param will call this contructor,but transfer null to it
            this.AnimalType = EnumAnimalType.Cat;
        }
    }
    /** without remark  */
    // tslint:disable-next-line:class-name & interface-name
    export interface Dog extends Animal {
    }
    /** without remark  */
    export  class DogImpl extends AnimalImpl implements Dog {
        /** without remark  */
        constructor() {
            super();
            // if (!this) return; // sometime jquery.param will call this contructor,but transfer null to it
        }
    }
    /** without remark  */
    // tslint:disable-next-line:class-name & interface-name
    export interface Person {
        /** without remark  */
        Name: null | string;
        /** without remark  */
        Upper: null | Manager;
    }
    /** without remark  */
    export  class PersonImpl implements Person {
        /** without remark  */
        Name: null | string;
        /** without remark  */
        Upper: null | Manager;
        /** without remark  */
        constructor() {
            this.Name = "";
            this.Upper = null;
        }
    }
    /** without remark  */
    // tslint:disable-next-line:class-name & interface-name
    export interface Manager extends Person {
        /** without remark  */
        DownPersons: null | Person[];
        /** without remark  */
        Duty: null | string;
    }
    /** without remark  */
    export  class ManagerImpl extends PersonImpl implements Manager {
        /** without remark  */
        DownPersons: null | Person[];
        /** without remark  */
        Duty: null | string;
        /** without remark  */
        constructor() {
            super();
            // if (!this) return; // sometime jquery.param will call this contructor,but transfer null to it
            this.DownPersons = [];
            this.Duty = "";
        }
    }
}
