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
export type Null_Or_WechatOrderWorkflowInTsGenAspnetExampleModels = Null_Or_<TsGenAspnetExample.Models.WechatOrderWorkflow>;
export type Null_Or_WechatOrderInTsGenAspnetExampleModels = Null_Or_<TsGenAspnetExample.Models.WechatOrder>;
// tslint:disable-next-line:max-line-length
export type Null_Or_GenericWorkFlowInTsGenAspnetExampleModels<TEntity,TState> = null | TsGenAspnetExample.Models.GenericWorkFlow<TEntity,TState>;
export type Null_Or_ManagerInTsGenAspnetExampleModels = Null_Or_<TsGenAspnetExample.Models.Manager>;
export type Null_Or_EmployeeInTsGenAspnetExampleModels = Null_Or_<TsGenAspnetExample.Models.Employee>;
export type Null_Or_DogInTsGenAspnetExampleModels = Null_Or_<TsGenAspnetExample.Models.Dog>;
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
        BaseUri: Null_Or_String;
        /** XDocument  */
        Document: Null_Or_XDocumentInSystemXmlLinq;
        /** XmlNodeType  */
        NodeType: System.Xml.XmlNodeType;
        /** XElement  */
        Parent: Null_Or_XElementInSystemXmlLinq;
        /** typename property */
        hbTypename?: string;
        /** System.Xml.Linq.XObject  */
        constructor() {
            this.BaseUri = "";
            this.Document = null;
            this.NodeType = System.Xml.XmlNodeType.None;
            this.Parent = null;
            this.hbTypename = "System.Xml.Linq.XObject";
        }
    }
    /** System.Xml.Linq.XNode  */
    export abstract class XNode extends XObject {
        /** XNode  */
        NextNode: Null_Or_XNodeInSystemXmlLinq;
        /** XNode  */
        PreviousNode: Null_Or_XNodeInSystemXmlLinq;
        /** System.Xml.Linq.XNode  */
        constructor() {
            super();
            this.NextNode = null;
            this.PreviousNode = null;
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
        FirstNode: Null_Or_XNodeInSystemXmlLinq;
        /** XNode  */
        LastNode: Null_Or_XNodeInSystemXmlLinq;
        /** System.Xml.Linq.XContainer  */
        constructor() {
            super();
            this.FirstNode = null;
            this.LastNode = null;
            this.hbTypename = "System.Xml.Linq.XContainer";
        }
    }
    /** System.Xml.Linq.XElement  */
    export class XElement extends XContainer {
        /** XAttribute  */
        FirstAttribute: Null_Or_XAttributeInSystemXmlLinq;
        /** Boolean  */
        HasAttributes: boolean;
        /** Boolean  */
        HasElements: boolean;
        /** Boolean  */
        IsEmpty: boolean;
        /** XAttribute  */
        LastAttribute: Null_Or_XAttributeInSystemXmlLinq;
        /** XName  */
        Name: Null_Or_XNameInSystemXmlLinq;
        /** XmlNodeType  */
        NodeType: System.Xml.XmlNodeType;
        /** String  */
        Value: Null_Or_String;
        /** System.Xml.Linq.XElement  */
        constructor() {
            super();
            this.FirstAttribute = null;
            this.HasAttributes = false;
            this.HasElements = false;
            this.IsEmpty = false;
            this.LastAttribute = null;
            this.Name =  new XName();
            this.NodeType = System.Xml.XmlNodeType.None;
            this.Value = "";
            this.hbTypename = "System.Xml.Linq.XElement";
        }
    }
    /** System.Xml.Linq.XName  */
    export class XName {
        /** String  */
        LocalName: Null_Or_String;
        /** XNamespace  */
        Namespace: Null_Or_XNamespaceInSystemXmlLinq;
        /** String  */
        NamespaceName: Null_Or_String;
        /** typename property */
        hbTypename?: string;
        /** System.Xml.Linq.XName  */
        constructor() {
            this.LocalName = "";
            this.Namespace =  new XNamespace();
            this.NamespaceName = "";
            this.hbTypename = "System.Xml.Linq.XName";
        }
    }
    /** System.Xml.Linq.XNamespace  */
    export class XNamespace {
        /** String  */
        NamespaceName: Null_Or_String;
        /** typename property */
        hbTypename?: string;
        /** System.Xml.Linq.XNamespace  */
        constructor() {
            this.NamespaceName = "";
            this.hbTypename = "System.Xml.Linq.XNamespace";
        }
    }
    /** System.Xml.Linq.XDocument  */
    export class XDocument extends XContainer {
        /** XDeclaration  */
        Declaration: Null_Or_XDeclarationInSystemXmlLinq;
        /** XDocumentType  */
        DocumentType: Null_Or_XDocumentTypeInSystemXmlLinq;
        /** XmlNodeType  */
        NodeType: System.Xml.XmlNodeType;
        /** XElement  */
        Root: Null_Or_XElementInSystemXmlLinq;
        /** System.Xml.Linq.XDocument  */
        constructor() {
            super();
            this.Declaration =  new XDeclaration();
            this.DocumentType = null;
            this.NodeType = System.Xml.XmlNodeType.Document;
            this.Root = null;
            this.hbTypename = "System.Xml.Linq.XDocument";
            // override parent class default value
            this.Document = null;
            this.Parent = null;
        }
    }
    /** System.Xml.Linq.XDeclaration  */
    export class XDeclaration {
        /** String  */
        Encoding: Null_Or_String;
        /** String  */
        Standalone: Null_Or_String;
        /** String  */
        Version: Null_Or_String;
        /** typename property */
        hbTypename?: string;
        /** System.Xml.Linq.XDeclaration  */
        constructor() {
            this.Encoding = "";
            this.Standalone = "";
            this.Version = "";
            this.hbTypename = "System.Xml.Linq.XDeclaration";
        }
    }
    /** System.Xml.Linq.XDocumentType  */
    export class XDocumentType extends XNode {
        /** String  */
        InternalSubset: Null_Or_String;
        /** String  */
        Name: Null_Or_String;
        /** XmlNodeType  */
        NodeType: System.Xml.XmlNodeType;
        /** String  */
        PublicId: Null_Or_String;
        /** String  */
        SystemId: Null_Or_String;
        /** System.Xml.Linq.XDocumentType  */
        constructor() {
            super();
            this.InternalSubset = "";
            this.Name = "";
            this.NodeType = System.Xml.XmlNodeType.None;
            this.PublicId = "";
            this.SystemId = "";
            this.hbTypename = "System.Xml.Linq.XDocumentType";
        }
    }
    /** System.Xml.Linq.XAttribute  */
    export class XAttribute extends XObject {
        /** Boolean  */
        IsNamespaceDeclaration: boolean;
        /** XName  */
        Name: Null_Or_XNameInSystemXmlLinq;
        /** XAttribute  */
        NextAttribute: Null_Or_XAttributeInSystemXmlLinq;
        /** XmlNodeType  */
        NodeType: System.Xml.XmlNodeType;
        /** XAttribute  */
        PreviousAttribute: Null_Or_XAttributeInSystemXmlLinq;
        /** String  */
        Value: Null_Or_String;
        /** System.Xml.Linq.XAttribute  */
        constructor() {
            super();
            this.IsNamespaceDeclaration = false;
            this.Name =  new XName();
            this.NextAttribute = null;
            this.NodeType = System.Xml.XmlNodeType.None;
            this.PreviousAttribute = null;
            this.Value = "";
            this.hbTypename = "System.Xml.Linq.XAttribute";
        }
    }
}
export namespace TsGenAspnetExample.Models {
    /** Abstract class of Animal  */
    export abstract class Animal implements IName {
        /** animal type  */
        AnimalType: EnumAnimalType;
        /** name of animal  */
        Name: Null_Or_String;
        /** typename property */
        hbTypename?: string;
        /** Abstract class of Animal  */
        constructor() {
            this.AnimalType = EnumAnimalType.Dog;
            this.Name = "";
            this.hbTypename = "TsGenAspnetExample.Models.Animal";
        }
    }
    /** enumerate of animal type  */
    export enum EnumAnimalType {
        /** Dog  */
        Dog = 0,
        /** Cat  */
        Cat = 1,
    }
    /** Class with XAttribut. Test if ca export System.Xml.Linq assembly.  */
    export class EntityWithXAttribute {
        /** test if ca export System.Xml.Linq assembly.  */
        XAttribute: Null_Or_XAttributeInSystemXmlLinq;
        /** typename property */
        hbTypename?: string;
        /** Class with XAttribut. Test if ca export System.Xml.Linq assembly.  */
        constructor() {
            this.XAttribute =  new System.Xml.Linq.XAttribute();
            this.hbTypename = "TsGenAspnetExample.Models.EntityWithXAttribute";
        }
    }
    /** struct test  */
    export class WechatOrderOwner extends System.ValueType implements IName {
        /** the name of Owner  */
        Name: Null_Or_String;
        /** struct test  */
        constructor() {
            super();
            this.Name = "";
            this.hbTypename = "TsGenAspnetExample.Models.WechatOrderOwner";
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
    /** Wechat Order Information  */
    export class WechatOrder {
        /** demostrate property with an interface  */
        CreateUser: Null_Or_INameInTsGenAspnetExampleModels;
        /** Order State  */
        CurrentState: EnumWechatOrderState;
        /** OrderId  */
        Id: number;
        /** Order Number  */
        OrderNumber: Null_Or_String;
        /** Wechat Order Check Result  */
        Result: CheckResult;
        /** the WechatOrder's work flow  */
        Workflow: Null_Or_WechatOrderWorkflowInTsGenAspnetExampleModels;
        /** typename property */
        hbTypename?: string;
        /** Wechat Order Information  */
        constructor() {
            this.CreateUser =  {} as any;
            this.CurrentState = EnumWechatOrderState.New;
            this.Id = 0;
            this.OrderNumber = "";
            this.Result = {"HasError":false,"ErrorReason":null};
            this.Workflow = null;
            this.hbTypename = "TsGenAspnetExample.Models.WechatOrder";
        }
    }
    /** enumerate of WechatOrder state  */
    export enum EnumWechatOrderState {
        /** New  */
        New = 0,
        /** Wait the user pay  */
        WaitPay = 1,
        /** user payed  */
        Payed = 2,
        /** complete the order  */
        Complete = 3,
        /** user payed failure or user dont pay  */
        Failure = 4,
    }
    /** Check result for all object  */
    export class CheckResult extends System.ValueType {
        /** when HasError=true, the error reason  */
        ErrorReason: Null_Or_String;
        /** Whether exists error  */
        HasError: boolean;
        /** Check result for all object  */
        constructor() {
            super();
            this.ErrorReason = "";
            this.HasError = false;
            this.hbTypename = "TsGenAspnetExample.Models.CheckResult";
        }
    }
    /** Name interface  */
    // tslint:disable-next-line:interface-name & class-name
    export interface IName {
        /** Name  */
        Name: Null_Or_String;
    }
    /** wechatorder's work flow  */
    export class WechatOrderWorkflow {
        /** wechat order instance  */
        Animal: Null_Or_WechatOrderInTsGenAspnetExampleModels;
        /** the next work flow  */
        NextFlow: Array<Null_Or_GenericWorkFlowInTsGenAspnetExampleModels<WechatOrder,EnumWechatOrderState>>;
        /** typename property */
        hbTypename?: string;
        /** wechatorder's work flow  */
        constructor() {
            this.Animal = null;
            this.NextFlow = [];
            this.hbTypename = "TsGenAspnetExample.Models.WechatOrderWorkflow";
        }
    }
    /** generic work flow  */
    export class GenericWorkFlow<TEntity,TState> {
        /** current state of bussiness object  */
        Current: TState;
        /** the instance of business object  */
        EntityInstance: TEntity;
        /** the next state of bussiness object  */
        Next: TState;
        /** typename property */
        hbTypename?: string;
        /** generic work flow  */
        constructor() {
            this.Current = {} as any;
            this.EntityInstance = {} as any;
            this.Next = {} as any;
            this.hbTypename = "TsGenAspnetExample.Models.GenericWorkFlow`2";
        }
    }
    /** Employee, used to test loop depends to  */
    export class Employee implements IName {
        /** age of this employee  */
        Age: number;
        /** name of Employee  */
        Name: Null_Or_String;
        /** the upper manager  */
        Upper: Null_Or_ManagerInTsGenAspnetExampleModels;
        /** typename property */
        hbTypename?: string;
        /** Employee, used to test loop depends to  */
        constructor() {
            this.Age = 0;
            this.Name = "";
            this.Upper = null;
            this.hbTypename = "TsGenAspnetExample.Models.Employee";
        }
    }
    /** Manager, used to test loop depends to  */
    export class Manager extends Employee implements IName {
        /** the Employee manged by this manager  */
        DownPersons: Array<Employee>;
        /** Duty  */
        Duty: Null_Or_String;
        /** Manager, used to test loop depends to  */
        constructor() {
            super();
            this.DownPersons = [];
            this.Duty = "";
            this.hbTypename = "TsGenAspnetExample.Models.Manager";
            // override parent class default value
            this.Upper = null;
        }
    }
}
