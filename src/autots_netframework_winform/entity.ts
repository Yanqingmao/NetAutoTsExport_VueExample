// attention, no license/license expired, will limit 20 Controller and 100 Actions.
// please access the https://www.max-media.cc/e/tssuitapply/create apply the license or contact dear.yanqingmao@hotmail.com to extend the license.
export type Null_Or_<TElement> =  null | TElement;
export type Null_Or_ArrayGeneral<TElement> =  Null_Or_<Array<TElement>>;
export type Null_Or_String = null | string;
export type Null_Or_XDocumentInSystemXmlLinq = Null_Or_<System.Xml.Linq.XDocument>;
export type Null_Or_XElementInSystemXmlLinq = Null_Or_<System.Xml.Linq.XElement>;
export type Null_Or_XNodeInSystemXmlLinq = Null_Or_<System.Xml.Linq.XNode>;
export type Null_Or_XAttributeInSystemXmlLinq = Null_Or_<System.Xml.Linq.XAttribute>;
export type Null_Or_XNameInSystemXmlLinq = Null_Or_<System.Xml.Linq.XName>;
export type Null_Or_XNamespaceInSystemXmlLinq = Null_Or_<System.Xml.Linq.XNamespace>;
export type Null_Or_XDeclarationInSystemXmlLinq = Null_Or_<System.Xml.Linq.XDeclaration>;
export type Null_Or_XDocumentTypeInSystemXmlLinq = Null_Or_<System.Xml.Linq.XDocumentType>;
export type Null_Or_INameInTsGenAspnetExampleModels = Null_Or_<TsGenAspnetExample.Models.IName>;
export type Null_Or_ManagerInTsGenAspnetExampleModels = Null_Or_<TsGenAspnetExample.Models.Manager>;
export type Null_Or_PersonInTsGenAspnetExampleModels = Null_Or_<TsGenAspnetExample.Models.Person>;
export type Null_Or_DogInTsGenAspnetExampleModels = Null_Or_<TsGenAspnetExample.Models.Dog>;
export type Null_Or_WechatOrderInTsGenAspnetExampleModels = Null_Or_<TsGenAspnetExample.Models.WechatOrder>;
// tslint:disable-next-line:max-line-length
export type Null_Or_GenericWorkFlowInTsGenAspnetExampleModels<TEntity,TState> = null | TsGenAspnetExample.Models.GenericWorkFlow<TEntity,TState>;
export type Null_Or_AnimalInTsGenAspnetExampleModels = Null_Or_<TsGenAspnetExample.Models.Animal>;
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
    /** System.Void  */
    export class Void extends ValueType {
        /** System.Void  */
        constructor() {
            super();
            this.hbTypename = "System.Void";
        }
    }
}
export namespace System.Xml {
    /** System.Xml.XmlNodeType  */
    export enum XmlNodeType {
        /** None  */
        None = 0,
        /** Element  */
        Element = 1,
        /** Attribute  */
        Attribute = 2,
        /** Text  */
        Text = 3,
        /** CDATA  */
        CDATA = 4,
        /** EntityReference  */
        EntityReference = 5,
        /** Entity  */
        Entity = 6,
        /** ProcessingInstruction  */
        ProcessingInstruction = 7,
        /** Comment  */
        Comment = 8,
        /** Document  */
        Document = 9,
        /** DocumentType  */
        DocumentType = 10,
        /** DocumentFragment  */
        DocumentFragment = 11,
        /** Notation  */
        Notation = 12,
        /** Whitespace  */
        Whitespace = 13,
        /** SignificantWhitespace  */
        SignificantWhitespace = 14,
        /** EndElement  */
        EndElement = 15,
        /** EndEntity  */
        EndEntity = 16,
        /** XmlDeclaration  */
        XmlDeclaration = 17,
    }
}
export namespace System.Xml.Linq {
    /** System.Xml.Linq.XObject  */
    export abstract class XObject {
        /** String  */
        baseUri: Null_Or_String;
        /** XDocument  */
        document: Null_Or_XDocumentInSystemXmlLinq;
        /** XmlNodeType  */
        nodeType: System.Xml.XmlNodeType;
        /** XElement  */
        parent: Null_Or_XElementInSystemXmlLinq;
        /** typename property */
        hbTypename?: string;
        /** System.Xml.Linq.XObject  */
        constructor() {
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XObject -- BaseUri
            this.baseUri = "";
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XObject -- Document
            this.document = null;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XObject -- NodeType
            this.nodeType = System.Xml.XmlNodeType.None;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XObject -- Parent
            this.parent = null;
            this.hbTypename = "System.Xml.Linq.XObject";
        }
    }
    /** System.Xml.Linq.XNode  */
    export abstract class XNode extends XObject {
        /** XNode  */
        nextNode: Null_Or_XNodeInSystemXmlLinq;
        /** XNode  */
        previousNode: Null_Or_XNodeInSystemXmlLinq;
        /** System.Xml.Linq.XNode  */
        constructor() {
            super();
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XNode -- NextNode
            this.nextNode = null;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XNode -- PreviousNode
            this.previousNode = null;
            this.hbTypename = "System.Xml.Linq.XNode";
        }
    }
    /** System.Xml.Linq.XNodeDocumentOrderComparer  */
    export class XNodeDocumentOrderComparer {
        /** typename property */
        hbTypename?: string;
        /** System.Xml.Linq.XNodeDocumentOrderComparer  */
        constructor() {
            this.hbTypename = "System.Xml.Linq.XNodeDocumentOrderComparer";
        }
    }
    /** System.Xml.Linq.XNodeEqualityComparer  */
    export class XNodeEqualityComparer {
        /** typename property */
        hbTypename?: string;
        /** System.Xml.Linq.XNodeEqualityComparer  */
        constructor() {
            this.hbTypename = "System.Xml.Linq.XNodeEqualityComparer";
        }
    }
    /** System.Xml.Linq.XContainer  */
    export abstract class XContainer extends XNode {
        /** XNode  */
        firstNode: Null_Or_XNodeInSystemXmlLinq;
        /** XNode  */
        lastNode: Null_Or_XNodeInSystemXmlLinq;
        /** System.Xml.Linq.XContainer  */
        constructor() {
            super();
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XContainer -- FirstNode
            this.firstNode = null;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XContainer -- LastNode
            this.lastNode = null;
            this.hbTypename = "System.Xml.Linq.XContainer";
        }
    }
    /** System.Xml.Linq.XElement  */
    export class XElement extends XContainer {
        /** XAttribute  */
        firstAttribute: Null_Or_XAttributeInSystemXmlLinq;
        /** Boolean  */
        hasAttributes: boolean;
        /** Boolean  */
        hasElements: boolean;
        /** Boolean  */
        isEmpty: boolean;
        /** XAttribute  */
        lastAttribute: Null_Or_XAttributeInSystemXmlLinq;
        /** XName  */
        name: Null_Or_XNameInSystemXmlLinq;
        /** XmlNodeType  */
        nodeType: System.Xml.XmlNodeType;
        /** String  */
        value: Null_Or_String;
        /** System.Xml.Linq.XElement  */
        constructor() {
            super();
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XElement -- FirstAttribute
            this.firstAttribute = null;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XElement -- HasAttributes
            this.hasAttributes = false;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XElement -- HasElements
            this.hasElements = false;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XElement -- IsEmpty
            this.isEmpty = false;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XElement -- LastAttribute
            this.lastAttribute = null;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XElement -- Name
            this.name =  new XName();
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XElement -- NodeType
            this.nodeType = System.Xml.XmlNodeType.None;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XElement -- Value
            this.value = "";
            this.hbTypename = "System.Xml.Linq.XElement";
        }
    }
    /** System.Xml.Linq.XName  */
    export class XName {
        /** String  */
        localName: Null_Or_String;
        /** XNamespace  */
        namespace: Null_Or_XNamespaceInSystemXmlLinq;
        /** String  */
        namespaceName: Null_Or_String;
        /** typename property */
        hbTypename?: string;
        /** System.Xml.Linq.XName  */
        constructor() {
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XName -- LocalName
            this.localName = "";
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XName -- Namespace
            this.namespace =  new XNamespace();
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XName -- NamespaceName
            this.namespaceName = "";
            this.hbTypename = "System.Xml.Linq.XName";
        }
    }
    /** System.Xml.Linq.XNamespace  */
    export class XNamespace {
        /** String  */
        namespaceName: Null_Or_String;
        /** typename property */
        hbTypename?: string;
        /** System.Xml.Linq.XNamespace  */
        constructor() {
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XNamespace -- NamespaceName
            this.namespaceName = "";
            this.hbTypename = "System.Xml.Linq.XNamespace";
        }
    }
    /** System.Xml.Linq.XDocument  */
    export class XDocument extends XContainer {
        /** XDeclaration  */
        declaration: Null_Or_XDeclarationInSystemXmlLinq;
        /** XDocumentType  */
        documentType: Null_Or_XDocumentTypeInSystemXmlLinq;
        /** XmlNodeType  */
        nodeType: System.Xml.XmlNodeType;
        /** XElement  */
        root: Null_Or_XElementInSystemXmlLinq;
        /** System.Xml.Linq.XDocument  */
        constructor() {
            super();
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XDocument -- Declaration
            this.declaration =  new XDeclaration();
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XDocument -- DocumentType
            this.documentType = null;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XDocument -- NodeType
            this.nodeType = System.Xml.XmlNodeType.Document;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XDocument -- Root
            this.root = null;
            this.hbTypename = "System.Xml.Linq.XDocument";
            // override parent class default value
            this.document = null;
            this.parent = null;
        }
    }
    /** System.Xml.Linq.XDeclaration  */
    export class XDeclaration {
        /** String  */
        encoding: Null_Or_String;
        /** String  */
        standalone: Null_Or_String;
        /** String  */
        version: Null_Or_String;
        /** typename property */
        hbTypename?: string;
        /** System.Xml.Linq.XDeclaration  */
        constructor() {
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XDeclaration -- Encoding
            this.encoding = "";
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XDeclaration -- Standalone
            this.standalone = "";
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XDeclaration -- Version
            this.version = "";
            this.hbTypename = "System.Xml.Linq.XDeclaration";
        }
    }
    /** System.Xml.Linq.XDocumentType  */
    export class XDocumentType extends XNode {
        /** String  */
        internalSubset: Null_Or_String;
        /** String  */
        name: Null_Or_String;
        /** XmlNodeType  */
        nodeType: System.Xml.XmlNodeType;
        /** String  */
        publicId: Null_Or_String;
        /** String  */
        systemId: Null_Or_String;
        /** System.Xml.Linq.XDocumentType  */
        constructor() {
            super();
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XDocumentType -- InternalSubset
            this.internalSubset = "";
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XDocumentType -- Name
            this.name = "";
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XDocumentType -- NodeType
            this.nodeType = System.Xml.XmlNodeType.None;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XDocumentType -- PublicId
            this.publicId = "";
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XDocumentType -- SystemId
            this.systemId = "";
            this.hbTypename = "System.Xml.Linq.XDocumentType";
        }
    }
    /** System.Xml.Linq.XAttribute  */
    export class XAttribute extends XObject {
        /** Boolean  */
        isNamespaceDeclaration: boolean;
        /** XName  */
        name: Null_Or_XNameInSystemXmlLinq;
        /** XAttribute  */
        nextAttribute: Null_Or_XAttributeInSystemXmlLinq;
        /** XmlNodeType  */
        nodeType: System.Xml.XmlNodeType;
        /** XAttribute  */
        previousAttribute: Null_Or_XAttributeInSystemXmlLinq;
        /** String  */
        value: Null_Or_String;
        /** System.Xml.Linq.XAttribute  */
        constructor() {
            super();
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XAttribute -- IsNamespaceDeclaration
            this.isNamespaceDeclaration = false;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XAttribute -- Name
            this.name =  new XName();
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XAttribute -- NextAttribute
            this.nextAttribute = null;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XAttribute -- NodeType
            this.nodeType = System.Xml.XmlNodeType.None;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XAttribute -- PreviousAttribute
            this.previousAttribute = null;
            // typePropertyHolder: System.Xml.Linq -- System.Xml.Linq -- XAttribute -- Value
            this.value = "";
            this.hbTypename = "System.Xml.Linq.XAttribute";
        }
    }
}
export namespace TsGenAspnetExample.Models {
    /** TsGenAspnetExample.Models.Animal  */
    export abstract class Animal implements IName {
        /** EnumAnimalType  */
        animalType: EnumAnimalType;
        /** String  */
        name: Null_Or_String;
        /** typename property */
        hbTypename?: string;
        /** TsGenAspnetExample.Models.Animal  */
        constructor() {
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- Animal -- AnimalType
            this.animalType = EnumAnimalType.Dog;
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- Animal -- Name
            this.name = "";
            this.hbTypename = "TsGenAspnetExample.Models.Animal";
        }
    }
    /** TsGenAspnetExample.Models.EnumAnimalType  */
    export enum EnumAnimalType {
        /** Dog  */
        Dog = 0,
        /** Cat  */
        Cat = 1,
    }
    /** TsGenAspnetExample.Models.EntityWithType  */
    export class EntityWithType {
        /** XAttribute  */
        xAttribute: Null_Or_XAttributeInSystemXmlLinq;
        /** typename property */
        hbTypename?: string;
        /** TsGenAspnetExample.Models.EntityWithType  */
        constructor() {
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- EntityWithType -- XAttribute
            this.xAttribute =  new System.Xml.Linq.XAttribute();
            this.hbTypename = "TsGenAspnetExample.Models.EntityWithType";
        }
    }
    /** this action has a JsonResultType(typeof(Dog))],  */
    export class Dog extends Animal implements IName {
        /** this action has a JsonResultType(typeof(Dog))],  */
        constructor() {
            super();
            this.hbTypename = "TsGenAspnetExample.Models.Dog";
        }
    }
    /** 微信订单定义  */
    export class WechatOrder {
        /** 接口  */
        createUser: Null_Or_INameInTsGenAspnetExampleModels;
        /** EnumOrderState  */
        currentState: EnumOrderState;
        /** Int32  */
        id: number;
        /** String  */
        orderNumber: Null_Or_String;
        /** CheckResult  */
        result: CheckResult;
        /** typename property */
        hbTypename?: string;
        /** 微信订单定义  */
        constructor() {
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- WechatOrder -- CreateUser
            this.createUser =  {} as any;
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- WechatOrder -- CurrentState
            this.currentState = EnumOrderState.New;
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- WechatOrder -- Id
            this.id = 0;
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- WechatOrder -- OrderNumber
            this.orderNumber = "";
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- WechatOrder -- Result
            this.result = {"hasError":false,"errorReason":null};
            this.hbTypename = "TsGenAspnetExample.Models.WechatOrder";
        }
    }
    /** TsGenAspnetExample.Models.EnumOrderState  */
    export enum EnumOrderState {
        /** New  */
        New = 0,
        /** WaitPay  */
        WaitPay = 1,
        /** Payed  */
        Payed = 2,
        /** Complete  */
        Complete = 3,
        /** Failure  */
        Failure = 4,
    }
    /** 对数据进行检查的结果  */
    export class CheckResult extends System.ValueType {
        /** 错误原因  */
        errorReason: Null_Or_String;
        /** 是否存在错误  */
        hasError: boolean;
        /** 对数据进行检查的结果  */
        constructor() {
            super();
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- CheckResult -- ErrorReason
            this.errorReason = "";
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- CheckResult -- HasError
            this.hasError = false;
            this.hbTypename = "TsGenAspnetExample.Models.CheckResult";
        }
    }
    /** 命名接口  */
    // tslint:disable-next-line:interface-name & class-name
    export interface IName {
        /** String  */
        name: Null_Or_String;
    }
    /** TsGenAspnetExample.Models.Person  */
    export class Person {
        /** String  */
        name: Null_Or_String;
        /** Manager  */
        upper: Null_Or_ManagerInTsGenAspnetExampleModels;
        /** typename property */
        hbTypename?: string;
        /** TsGenAspnetExample.Models.Person  */
        constructor() {
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- Person -- Name
            this.name = "";
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- Person -- Upper
            this.upper = null;
            this.hbTypename = "TsGenAspnetExample.Models.Person";
        }
    }
    /** TsGenAspnetExample.Models.Manager  */
    export class Manager extends Person {
        /** List`1  */
        downPersons: Array<Person>;
        /** String  */
        duty: Null_Or_String;
        /** TsGenAspnetExample.Models.Manager  */
        constructor() {
            super();
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- Manager -- DownPersons
            this.downPersons = [];
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- Manager -- Duty
            this.duty = "";
            this.hbTypename = "TsGenAspnetExample.Models.Manager";
            // override parent class default value
            this.upper = null;
        }
    }
    /** 泛型工作流类定义  */
    export class GenericWorkFlow<TEntity,TState> {
        /** 当前状态  */
        current: TState;
        /** 实体实例  */
        entityInstance: TEntity;
        /** 下一个状态  */
        next: TState;
        /** typename property */
        hbTypename?: string;
        /** 泛型工作流类定义  */
        constructor() {
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- GenericWorkFlow`2 -- Current
            this.current = {} as any;
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- GenericWorkFlow`2 -- EntityInstance
            this.entityInstance = {} as any;
            // typePropertyHolder: TsGenAspnetExample -- TsGenAspnetExample.Models -- GenericWorkFlow`2 -- Next
            this.next = {} as any;
            this.hbTypename = "TsGenAspnetExample.Models.GenericWorkFlow`2";
        }
    }
}
