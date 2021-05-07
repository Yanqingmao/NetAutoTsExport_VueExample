// attention, no license/license expired, will limit 20 Controller and 100 Actions.
// please access the https://www.max-media.cc/e/tssuitapply/create apply the license or contact dear.yanqingmao@hotmail.com to extend the license.
export type Null_Or_<TElement> =  null | TElement;
export type Null_Or_ArrayGeneral<TElement> =  Null_Or_<Array<TElement>>;
export type Null_Or_String = null | string;
export type Null_Or_ManagerInTsGenCoreExampleModels = Null_Or_<TsGenCoreExample.Models.Manager>;
export type Null_Or_HouseInTsGenCoreExampleModels = Null_Or_<TsGenCoreExample.Models.House>;
export type Null_Or_CatInTsGenCoreExampleModels = Null_Or_<TsGenCoreExample.Models.Cat>;
export type Null_Or_PersonInTsGenCoreExampleModels = Null_Or_<TsGenCoreExample.Models.Person>;
export type Null_Or_EntityWithTypeInTsGenCoreExampleModels = Null_Or_<TsGenCoreExample.Models.EntityWithType>;
export type Null_Or_GenericJsonResponsesInTsGenCoreExampleModels<TData> = null | TsGenCoreExample.Models.GenericJsonResponses<TData>;
export type Null_Or_GenericWorkFlowInTsGenCoreExampleModels<TModel,KModel> = null | TsGenCoreExample.Models.GenericWorkFlow<TModel,KModel>;
export type Null_Or_ErrorViewModelInTsGenCoreExampleModels = Null_Or_<TsGenCoreExample.Models.ErrorViewModel>;
export namespace System {
    /** 输出 Tuple 元组类型 */
    // tslint:disable-next-line:class-name
    export class Tuple_1<T1 = {}> {
       Item1: T1 = {} as any;
    }

    /** 输出 Tuple 元组类型 */
    // tslint:disable-next-line:class-name
    export class Tuple_2<T1 = {},T2 = {}> extends Tuple_1<T1> {
       Item2: T2 = {} as any;
    }

    /** System.ValueType  */
    export abstract class ValueType {
        /** typename property */
        hbTypename?: string;
        /** System.ValueType  */
        constructor() {
            this.hbTypename = "System.ValueType";
        }
    }
}
export namespace Hongbo.Basic.Systems {
    /** Hongbo.Basic.Systems.CheckResult  */
    export class CheckResult extends System.ValueType {
        /** String  */
        errorReason: Null_Or_String;
        /** Boolean  */
        hasError: boolean;
        /** Hongbo.Basic.Systems.CheckResult  */
        constructor() {
            super();
            // : Hongbo.Basic -- Hongbo.Basic.Systems -- CheckResult -- ErrorReason
            this.errorReason = "";
            // : Hongbo.Basic -- Hongbo.Basic.Systems -- CheckResult -- HasError
            this.hasError = false;
            this.hbTypename = "Hongbo.Basic.Systems.CheckResult";
        }
    }
}
export namespace Hongbo.Ef {
    /** Hongbo.Ef.IdEntity  */
    export class IdEntity {
        /** Int32  */
        id: number;
        /** typename property */
        hbTypename?: string;
        /** Hongbo.Ef.IdEntity  */
        constructor() {
            // : Hongbo.Ef -- Hongbo.Ef -- IdEntity -- Id
            this.id = 0;
            this.hbTypename = "Hongbo.Ef.IdEntity";
        }
    }
    /** Hongbo.Ef.IdAndGuidEntity  */
    export class IdAndGuidEntity extends IdEntity {
        /** String  */
        guid: Null_Or_String;
        /** Hongbo.Ef.IdAndGuidEntity  */
        constructor() {
            super();
            // : Hongbo.Ef -- Hongbo.Ef -- IdAndGuidEntity -- Guid
            this.guid = "4b9584d45e41485eb418856e160785c5";
            this.hbTypename = "Hongbo.Ef.IdAndGuidEntity";
        }
    }
    /** Hongbo.Ef.IdAndGuidAndCreateDatetimeEntity  */
    export class IdAndGuidAndCreateDatetimeEntity extends IdAndGuidEntity {
        /** DateTime  */
        createDateTime: Date;
        /** Hongbo.Ef.IdAndGuidAndCreateDatetimeEntity  */
        constructor() {
            super();
            // : Hongbo.Ef -- Hongbo.Ef -- IdAndGuidAndCreateDatetimeEntity -- CreateDateTime
            this.createDateTime = new Date();
            this.hbTypename = "Hongbo.Ef.IdAndGuidAndCreateDatetimeEntity";
            // override parent class default value
            this.guid = "3dda9fcca32d4849b13d39e341a52442";
        }
    }
    /** Hongbo.Ef.IdAndGuidAndCreateDatetimeAndModifyDatetimeEntity  */
    export class IdAndGuidAndCreateDatetimeAndModifyDatetimeEntity extends IdAndGuidAndCreateDatetimeEntity {
        /** DateTime  */
        lastModifyDateTime: Date;
        /** Hongbo.Ef.IdAndGuidAndCreateDatetimeAndModifyDatetimeEntity  */
        constructor() {
            super();
            // : Hongbo.Ef -- Hongbo.Ef -- IdAndGuidAndCreateDatetimeAndModifyDatetimeEntity -- LastModifyDateTime
            this.lastModifyDateTime = new Date();
            this.hbTypename = "Hongbo.Ef.IdAndGuidAndCreateDatetimeAndModifyDatetimeEntity";
            // override parent class default value
            this.guid = "59aaefe3c77748378f0bda9690988ed6";
        }
    }
    /** Hongbo.Ef.IdAndGuidAndNameAndCreateDatetimeAndModifyDatetimeEntity  */
    export class IdAndGuidAndNameAndCreateDatetimeAndModifyDatetimeEntity extends IdAndGuidAndCreateDatetimeAndModifyDatetimeEntity {
        /** String  */
        name: Null_Or_String;
        /** Hongbo.Ef.IdAndGuidAndNameAndCreateDatetimeAndModifyDatetimeEntity  */
        constructor() {
            super();
            // : Hongbo.Ef -- Hongbo.Ef -- IdAndGuidAndNameAndCreateDatetimeAndModifyDatetimeEntity -- Name
            this.name = "";
            this.hbTypename = "Hongbo.Ef.IdAndGuidAndNameAndCreateDatetimeAndModifyDatetimeEntity";
            // override parent class default value
            this.guid = "42bdcadcfb61413eb573959e26d5e941";
        }
    }
}
export namespace TsGenCoreExample.Models {
    /** TsGenCoreExample.Models.Person  */
    export class Person {
        /** Int32  */
        age: number;
        /** String  */
        name: Null_Or_String;
        /** Manager  */
        upper: Null_Or_ManagerInTsGenCoreExampleModels;
        /** typename property */
        hbTypename?: string;
        /** TsGenCoreExample.Models.Person  */
        constructor() {
            // : TsGenCoreExample -- TsGenCoreExample.Models -- Person -- Age
            this.age = 0;
            // : TsGenCoreExample -- TsGenCoreExample.Models -- Person -- Name
            this.name = "";
            // : TsGenCoreExample -- TsGenCoreExample.Models -- Person -- Upper
            this.upper = null;
            this.hbTypename = "TsGenCoreExample.Models.Person";
        }
    }
    /** TsGenCoreExample.Models.Manager  */
    export class Manager extends Person {
        /** House  */
        live: Null_Or_HouseInTsGenCoreExampleModels;
        /** TsGenCoreExample.Models.Manager  */
        constructor() {
            super();
            // : TsGenCoreExample -- TsGenCoreExample.Models -- Manager -- Live
            this.live = null;
            this.hbTypename = "TsGenCoreExample.Models.Manager";
            // override parent class default value
            this.upper = null;
        }
    }
    /** TsGenCoreExample.Models.House  */
    export class House {
        /** String  */
        address: Null_Or_String;
        /** Manager  */
        liveManager: Null_Or_ManagerInTsGenCoreExampleModels;
        /** typename property */
        hbTypename?: string;
        /** TsGenCoreExample.Models.House  */
        constructor() {
            // : TsGenCoreExample -- TsGenCoreExample.Models -- House -- Address
            this.address = "";
            // : TsGenCoreExample -- TsGenCoreExample.Models -- House -- LiveManager
            this.liveManager = null;
            this.hbTypename = "TsGenCoreExample.Models.House";
        }
    }
    /** TsGenCoreExample.Models.ErrorViewModel  */
    export class ErrorViewModel {
        /** EnumCode  */
        code: EnumCode;
        /** String  */
        requestId: Null_Or_String;
        /** Boolean  */
        showRequestId: boolean;
        /** typename property */
        hbTypename?: string;
        /** TsGenCoreExample.Models.ErrorViewModel  */
        constructor() {
            // : TsGenCoreExample -- TsGenCoreExample.Models -- ErrorViewModel -- Code
            this.code = EnumCode.Success;
            // : TsGenCoreExample -- TsGenCoreExample.Models -- ErrorViewModel -- RequestId
            this.requestId = "";
            // : TsGenCoreExample -- TsGenCoreExample.Models -- ErrorViewModel -- ShowRequestId
            this.showRequestId = false;
            this.hbTypename = "TsGenCoreExample.Models.ErrorViewModel";
        }
    }
    /** TsGenCoreExample.Models.EnumCode  */
    export enum EnumCode {
        /** Success  */
        Success = 0,
        /** Error  */
        Error = 1,
    }
    /** TsGenCoreExample.Models.Animal  */
    export abstract class Animal extends Hongbo.Ef.IdAndGuidAndNameAndCreateDatetimeAndModifyDatetimeEntity {
        /** EnumAnimalType  */
        animalType: EnumAnimalType;
        /** String  */
        name: Null_Or_String;
        /** TsGenCoreExample.Models.Animal  */
        constructor() {
            super();
            // : TsGenCoreExample -- TsGenCoreExample.Models -- Animal -- AnimalType
            this.animalType = EnumAnimalType.Dog;
            // : TsGenCoreExample -- TsGenCoreExample.Models -- Animal -- Name
            this.name = "";
            this.hbTypename = "TsGenCoreExample.Models.Animal";
        }
    }
    /** TsGenCoreExample.Models.EnumAnimalType  */
    export enum EnumAnimalType {
        /** Dog  */
        Dog = 0,
        /** Cat  */
        Cat = 1,
        /** Mouse  */
        Mouse = 2,
    }
    /** TsGenCoreExample.Models.Cat  */
    export class Cat extends Animal {
        /** Int32  */
        catchMouseCount: number;
        /** TsGenCoreExample.Models.Cat  */
        constructor() {
            super();
            // : TsGenCoreExample -- TsGenCoreExample.Models -- Cat -- CatchMouseCount
            this.catchMouseCount = 0;
            this.hbTypename = "TsGenCoreExample.Models.Cat";
            // override parent class default value
            this.animalType = EnumAnimalType.Cat;
            this.guid = "2e92510c59e24ba1b97fe526b693466b";
        }
    }
    /** TsGenCoreExample.Models.EntityWithType  */
    export class EntityWithType {
        /** typename property */
        hbTypename?: string;
        /** TsGenCoreExample.Models.EntityWithType  */
        constructor() {
            this.hbTypename = "TsGenCoreExample.Models.EntityWithType";
        }
    }
    /** TsGenCoreExample.Models.Dog  */
    export class Dog extends Animal {
        /** Int32  */
        catchMouseCount: number;
        /** TsGenCoreExample.Models.Dog  */
        constructor() {
            super();
            // : TsGenCoreExample -- TsGenCoreExample.Models -- Dog -- CatchMouseCount
            this.catchMouseCount = 0;
            this.hbTypename = "TsGenCoreExample.Models.Dog";
            // override parent class default value
            this.guid = "dbd2651c04cd4b57a28c17fbb54b667f";
        }
    }
    /** TsGenCoreExample.Models.GenericWorkFlow`2  */
    export class GenericWorkFlow<TModel,KModel> {
        /** TModel  */
        current: TModel;
        /** KModel  */
        next: KModel;
        /** typename property */
        hbTypename?: string;
        /** TsGenCoreExample.Models.GenericWorkFlow`2  */
        constructor() {
            // : TsGenCoreExample -- TsGenCoreExample.Models -- GenericWorkFlow`2 -- Current
            this.current = {} as any;
            // : TsGenCoreExample -- TsGenCoreExample.Models -- GenericWorkFlow`2 -- Next
            this.next = {} as any;
            this.hbTypename = "TsGenCoreExample.Models.GenericWorkFlow`2";
        }
    }
    /** TsGenCoreExample.Models.GenericJsonResponses`1  */
    export class GenericJsonResponses<TData> {
        /** TData  */
        data: TData;
        /** typename property */
        hbTypename?: string;
        /** TsGenCoreExample.Models.GenericJsonResponses`1  */
        constructor() {
            // : TsGenCoreExample -- TsGenCoreExample.Models -- GenericJsonResponses`1 -- Data
            this.data = {} as any;
            this.hbTypename = "TsGenCoreExample.Models.GenericJsonResponses`1";
        }
    }
}
