import * as Entitys from "./entity";
import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";

export namespace Hongbo {
    /** handle the request before a request send to server
     */
    // tslint:disable-next-line:max-line-length
    type PrehandleRequestBeforeSendToServer = (url: string, content: IMethodBodyHeader, request:  AxiosRequestConfig) =>  AxiosRequestConfig;
    /** prehandle the request/response before a request send to/receive from server
     */
    type PrehandleResponseAfterServerReturn = (url: string, content: IMethodBodyHeader, promiseResponse: Promise<any>) => Promise<any>;
    type IPrehandleRequestOption<TPrehandle> = {
        neeClearAfterCalled: boolean;
        prehandle: TPrehandle;
    };
    /** rout define in control or action */
    export interface IRouteDefine {
        /** route define in control or action,
         *  when control is webapi control, this should be null;
         */
        RouteContent?: string;

        /** RouteArea in MVC controller  */
        RouteAreaContent?: string;

        /** RoutePrefix in MVC controller  */
        RoutePrefixDefine?: string;

        /** the ActionName in MVC action. */
        ActionNameContent?: string;
    }
    /** the control type enum */
    export enum EnumControlMode {
        /** WebApi controller */
        WebApi = 0,
        /** MVC controller, but only support the action which should return the Json result */
        Mvc = 1,
        /** SignalR control, not supported on this version */
        SignalR = 2, // maybe supported in the later
    }
    /** the .net environment */
    export enum EnumEnvironment {
        /** AspNet */
        AspNet = 0,
        /** NetCore */
        NetCore = 1
    }
    /**
     * define how one parameter send to server
     */
    export interface IParameterFromDefine {
        /** will send to server by raw json */
        IsFromBody?: boolean;
        IsFromForm?: boolean;
        IsFromHeader?: boolean;
        IsFromQuery?: boolean;
        IsFromRoute?: boolean;
    }

    /** the parameter defined in action */
    export interface IActionParameterDefine {
        name: string;
        fromDefine?: IParameterFromDefine;
        value?: any;
        filledToRoute?: boolean;
        filledToQuery?: boolean;
        filledToHead?: boolean;
    }
    /** Action in one controller */
    export class HongboRootAction {
        actionName?: string;
        name: string = "";
        httpMethod?: IHttpMethodDefine;
        routeDefine?: IRouteDefine;
        inParameterDefines: IActionParameterDefine[] = [];
        // outParameterDefine: ActionParameterDefine;

        /** parce the action accord the actionName or the routeDefeine on this action */
        parceActionName(): string {
            if (this.actionName) {
                return this.actionName;
            }
            return this.name;
        }
    }
    /** the httpmethod defined on Action */
    export interface IHttpMethodDefine {
        /** if true， will send data to server by query url */
        IsHttpGet?: boolean;
        IsHttpPost?: boolean;
        IsHttpDelete?: boolean;
        IsHttpOptions?: boolean;
        IsHttpPatch?: boolean;
        IsHttpPut?: boolean;
        IsHttpHead?: boolean;
    }
    /** control option  */
    export interface IControlOption {
        /** the type name of Controller */
        controlTypeName: string;
        /** .net environment, default will be the .NetCore  */
        environment: EnumEnvironment;
        /** the mode of Controller, default will be the WebApi */
        controlMode: EnumControlMode;
        /** ths route defined on Controller */
        routeDefine?: IRouteDefine;
    }
    /** RootController define, all control should extends from this implicit or explicit */
    export class HongboRootControl {
        /** the base url  */
        static BaseUrl: string = "http://localhost";

        /** the default MVC route, see the Startups.cs or RouteConfig.cs, if option, please assign the id?  */
        static DefaulMvctRoute: string = "{controller}/{action}/{id?}";

        /** the default MVC route, see the Startups.cs or WebApiConfig.cs, if option, please assign the id?  */
        static DefaulWebapitRoute: string = "api/{controller}/{id}";

        private static globalPrehandleRequestOption?: IPrehandleRequestOption<PrehandleRequestBeforeSendToServer>;
        /** prehandle the requesoption instance before every request send to server
         *  @param prehandleRequestOption -- prehandle option instance
         *      if the neeClearAfterCalled is set true, will clear HongboRootControl.globalPrehandleRequestOption, so
         *       you must call SetGlobalBeforeRequest function;
         *      if the neeClearAfterCalled is set false, will remain HongboRootControl.globalPrehandleRequestOption, so
         *       will handle the request before every action send data to the server;
         */
        static SetGlobalBeforeRequest(prehandleRequestOption: IPrehandleRequestOption<PrehandleRequestBeforeSendToServer>): void {
            HongboRootControl.globalPrehandleRequestOption = prehandleRequestOption;
        }

        private static globalPrehandleResponseOption?: IPrehandleRequestOption<PrehandleResponseAfterServerReturn>;
        /** prehandle every the response after receive data from server,
         *  if set, it will handle all the response from server.
         *  @param prehandleRequestOption -- prehandle option instance
         *      if the neeClearAfterCalled is set true, will clear HongboRootControl.globalPrehandleResponseOption, so
         *       you must call SetGlobalAfterRequest function;
         *      if the neeClearAfterCalled is set false, will remain HongboRootControl.globalPrehandleResponseOption, so
         *       will handle the response before response act as the result the action;
         */
        static SetGlobalAfterRequest(prehandleResponseOption: IPrehandleRequestOption<PrehandleResponseAfterServerReturn>): void {
            HongboRootControl.globalPrehandleResponseOption = prehandleResponseOption;
        }

        protected controlOption: IControlOption = {
            controlTypeName: "",
            environment: EnumEnvironment.NetCore,
            controlMode: EnumControlMode.WebApi
        };

        /** the type name of Controller */
        public controlTypeName: string = "";

        /** .net environment, default will be the .NetCore  */
        public environment: EnumEnvironment = EnumEnvironment.NetCore;

        /** the mode of Controller, default will be the WebApi */
        public controlMode: EnumControlMode = EnumControlMode.WebApi;

        /** ths route defined on Controller */
        public routeDefine?: IRouteDefine;

        /**
         * execute the action
         */
        protected callAction(actionDefine: HongboRootAction): Promise<any> {
            let url: string = "";
            if (this.controlOption.controlMode === EnumControlMode.Mvc) {
                url = RouteUtil.calculateMvcUrl(this.controlOption, actionDefine);
            } else if (this.controlOption.controlMode === EnumControlMode.WebApi) {
                url = RouteUtil.calculateWebApiUrl(this.controlOption, actionDefine);
            } else {
                throw "We're sorry, the signalR will supported soon.";
            }
            if (HongboRootControl.BaseUrl.endsWith("/") || url.startsWith("/")) {
                url = HongboRootControl.BaseUrl + url;
            } else {
                url = HongboRootControl.BaseUrl + "/" + url;
            }
            let prehandleRequest: PrehandleRequestBeforeSendToServer = (url, content, request) => {
                if (HongboRootControl.globalPrehandleRequestOption && HongboRootControl.globalPrehandleRequestOption.prehandle) {
                    request = HongboRootControl.globalPrehandleRequestOption.prehandle(url, content, request);
                    if (HongboRootControl.globalPrehandleRequestOption.neeClearAfterCalled) {
                        HongboRootControl.globalPrehandleRequestOption = undefined;
                    }
                }
                return request;
            };
            let content: IMethodBodyHeader = ContentUtil.calculateMethodBodyHead(this.controlOption, actionDefine);
            try {
                 let result: Promise<any> = HongboRootControl.sendRequestToServer(url, content, prehandleRequest);
                 if (HongboRootControl.globalPrehandleResponseOption && HongboRootControl.globalPrehandleResponseOption.prehandle) {
                    result = HongboRootControl.globalPrehandleResponseOption.prehandle(url, content, result);
                    if (HongboRootControl.globalPrehandleResponseOption.neeClearAfterCalled) {
                        HongboRootControl.globalPrehandleResponseOption = undefined;
                    }
                }
                 return result;
            } catch (e) {
                return Promise.reject(e);
            }
        }

        // tslint:disable-next-line:max-line-length
        private static async sendRequestToServer(url: string, content: IMethodBodyHeader, prehandleRequest: PrehandleRequestBeforeSendToServer): Promise<any> {
            let request: AxiosRequestConfig = {
                method: content.method as Method,
                url: url,
                headers: content.headers,
                data: content.body
            };
            request = prehandleRequest(url, content, request);
            let result: AxiosResponse<any> = await axios.request(request);
            return result.data;
        }

    }
    /**
     * Http 的 Method、Body、Header
     */
    export interface IMethodBodyHeader {
        method: string;
        body?: FormData | string;
        headers: Record<string, string>;
    }
    /** 根据 ControlDefine 和 ActionDefine 获取 Http Header 定义的工具类 */
    export class ContentUtil {
        /**
         * 根据 ControlDefine 和 ActionDefine 计算 Http Header
         * @returns Record<string, string>
         */
        static calculateMethodBodyHead(controlDefine: IControlOption, actionDefine: HongboRootAction): IMethodBodyHeader {
            let method: string = ContentUtil.calculateMethod(controlDefine, actionDefine);
            let headers: Record<string, string> = {};
            let params: IActionParameterDefine[] = actionDefine.inParameterDefines;
            headers.Accept = "application/json";
            ContentUtil.calculuateFromHeadParams(actionDefine, headers);
            if (method === "get") { return { method, headers: headers }; }
            DebugUtil.info(params);
            let fromBodyParam: IActionParameterDefine[] = params.filter((x) => {
                if (x.value === undefined) { return false; }
                let from: IParameterFromDefine | undefined = x.fromDefine;
                if (from && from.IsFromBody) { return true; }
                return false;
            });
            if (fromBodyParam.length > 0) { // exists from body
                headers["Content-Type"] = "application/json";
                let bodyString: string = JSON.stringify(fromBodyParam[0].value);
                return { method: method, body: bodyString, headers: headers };  // 这儿就返回,因为以 Raw方式提交数据，不应该还能够提交其他数据
            }
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            let body: FormData = new FormData();
            DebugUtil.info("参数", JSON.stringify(params));
            let leftParams: IActionParameterDefine[] = params.filter((x) => !x.filledToRoute && !x.filledToQuery
                && !x.filledToHead && (x.value !== undefined));
            DebugUtil.info("剩余未填充到路由、query、Header 的参数", leftParams);
            leftParams.forEach((param) => {
                if (param.value !== undefined) {
                    let value: any = param.value;
                    // how transfer null param value ?
                    if (typeof (value) === "string" || typeof (value) === "number" || typeof (value) === "boolean") {
                        DebugUtil.info("添加参数和值到 formBody:" + param.name + "=" + value);
                        body.set(param.name, "" + value);
                    } else if (value !== null) {
                        headers["Content-Type"] = "multipart/form-data";
                        if (value.size && value.name && value.lastModified) { // is file
                            body.set(param.name, value, value.name);
                        } else {  // not file, transfer use json format
                            DebugUtil.info("添加参数和值到 formBody:" + param.name + "=" + JSON.stringify(value));
                            body.append(param.name, JSON.stringify(value));
                            DebugUtil.info("添加了参数和值后的 formBody:", body);
                        }
                    }
                }
            });
            return { method: method, body: body, headers: headers };
        }
        /** 处理 fromHead 参数 */
        static calculuateFromHeadParams(actionDefine: HongboRootAction, headers: Record<string, string>): void {
            let params: IActionParameterDefine[] = actionDefine.inParameterDefines;
            let fromHeadParams: IActionParameterDefine[] = params.filter((x) => {
                let from: IParameterFromDefine | undefined = x.fromDefine;
                if (from && from.IsFromHeader) { return true; }
                return false;
            });
            fromHeadParams.forEach(element => {
                element.filledToHead = true;
                if (element.value !== undefined) {
                    headers[element.name] = element.value;
                }
            });
        }
        /** 计算提交过来的参数 */
        static calculateMethod(controlDefine: IControlOption, actionDefine: HongboRootAction): string {
            let params: IActionParameterDefine[] = actionDefine.inParameterDefines;
            let fromDefine: IHttpMethodDefine | undefined = actionDefine.httpMethod;
            // action 中明确定义了方法，则使用 action 中的 HttpMethod 方法
            if (fromDefine) {
                if (fromDefine.IsHttpGet) { return "get"; }
                if (fromDefine.IsHttpDelete) { return "delete"; }
                if (fromDefine.IsHttpHead) { return "head"; }
                if (fromDefine.IsHttpOptions) { return "options"; }
                if (fromDefine.IsHttpPatch) { return "patch"; }
                if (fromDefine.IsHttpPut) { return "put"; }
                if (fromDefine.IsHttpPost) { return "post"; }
            }
            // 如果 action 中没有明确定义方法，则判断参数是否有 fromBody 或者 fromForm,
            // 如果有，则使用 post 方式提交参数
            if (params.filter((x) => {
                let from: IParameterFromDefine | undefined = x.fromDefine;
                if (from && (from.IsFromBody || from.IsFromForm)) { return true; }
                let value: any = x.value;
                if (typeof (value) === "object") { return true; }
                return false;
            }).length > 0) {
                return "post";
            }
            // 最后使用 get 形式
            return "get";
        }
    }

    export class DebugUtil {
        static enableDebug: boolean = false;
        static info(...msgs: any[]): void {
            if (this.enableDebug) {
                console.log(JSON.stringify(msgs));
            }
        }
    }
    /** 路由段的工具类 */
    export class RouteSegment {
        /** 路由匹配到的参数名称,但也可能是一个固定字符串 */
        name: string = "";
        /** 固定字符串，无参数形式 */
        isFixed?: boolean = false;
        /** 是否是可选参数 */
        isOptional?: boolean = false;
        /** 指定的默认值 */
        defaultValue?: string;
        /** 指定的参数值 */
        assignParamInfo?: IActionParameterDefine;
    }
    export class RouteUtil {
        /**
         * 在 WebApi模式中, 根据路由和给定的参数计算发送请求的 Url
         */
        static calculateWebApiUrl(controlDefine: IControlOption, actionDefine: HongboRootAction): string {
            let url: string = "";
            // asp.net ， the route defined on action will replace the route on control
            if (controlDefine.environment === EnumEnvironment.AspNet) {
                // route prefix defined on Controller, only in asp.net webapi
                // webapi 时，不允许路由以 / 开头
                if (controlDefine.routeDefine && controlDefine.routeDefine.RoutePrefixDefine) { //
                    url += `${controlDefine.routeDefine.RoutePrefixDefine}/`;
                }
                let actionRoute: string = RouteUtil.parceActionRoute(controlDefine, actionDefine);
                if (actionRoute) { url += actionRoute; } else { url += RouteUtil.parceControllerRoute(controlDefine, actionDefine); }
            } else {
                // netcore, the route on control and action will be combined.
                let actionRoute: string = RouteUtil.parceActionRoute(controlDefine, actionDefine);
                if (actionRoute.startsWith("/")) { // when action startwith / , it will be used directly
                    url += actionRoute;
                } else {
                    url += RouteUtil.parceControllerRoute(controlDefine, actionDefine);
                    url += "/" + actionRoute;
                }
            }
            if (!url) {
                url = RouteUtil.parceRouteTemplate(HongboRootControl.DefaulWebapitRoute, controlDefine, actionDefine);
            }
            return url;
        }

        /**
         * 在 MVC模式中, 根据路由和给定的参数计算发送请求的 Url
         */
        static calculateMvcUrl(controlDefine: IControlOption, actionDefine: HongboRootAction): string {
            let url: string = "";

            // asp.net ， the route defined on action will replace the route on control
            if (controlDefine.environment === EnumEnvironment.AspNet) {
                // route area defined on Controller , only in asp.net mvc
                url += RouteUtil.parceRouteArea(controlDefine, actionDefine);
                DebugUtil.info("parceRouteArea", url);
                // route prefix defined on Controller , only in asp.net mvc or asp.net webapi
                url += RouteUtil.parceRoutePrefix(controlDefine, actionDefine);
                DebugUtil.info("parceRoutePrefix", url);

                let actionRoute: string = RouteUtil.parceActionRoute(controlDefine, actionDefine);
                DebugUtil.info("parceActionRoute", actionRoute);
                if (actionRoute) {
                    url += actionRoute;
                    DebugUtil.info(url);
                } else {
                    const controlRoute: string = RouteUtil.parceControllerRoute(controlDefine, actionDefine);
                    DebugUtil.info("parceControllerRoute", controlRoute);
                    url += controlRoute;
                    DebugUtil.info(url);
                }
            } else {
                // netcore, the route on control and action will be combined.
                let actionRoute: string = RouteUtil.parceActionRoute(controlDefine, actionDefine);
                if (actionRoute.startsWith("/")) { // when action startwith / , it will be used directly
                    url += actionRoute;
                } else {
                    url += RouteUtil.parceControllerRoute(controlDefine, actionDefine);
                    if (actionRoute) { url = url + "/" + actionRoute; }
                }
            }
            if (!url) {
                url += RouteUtil.parceRouteTemplate(HongboRootControl.DefaulMvctRoute, controlDefine, actionDefine);
            }
            let queryPar: string = RouteUtil.combineFromQueryParameter(controlDefine, actionDefine);
            if (queryPar) { url = url + "?" + queryPar; }
            return url;
        }

        /** 明确指定了 fromQuery 或者 action指定了 httpGet 方法, 产生 queryString */
        private static combineFromQueryParameter(controlDefine: IControlOption, actionDefine: HongboRootAction): string {
            if (actionDefine.inParameterDefines) {
                let httpGet: boolean = ContentUtil.calculateMethod(controlDefine, actionDefine) === "get";
                DebugUtil.info(" HTTPGet=" + httpGet);
                let params: IActionParameterDefine[] = actionDefine.inParameterDefines.filter((x) => {
                    if (x.value === undefined) {
                        DebugUtil.info("undefined不再填充到 query");
                        return false;
                    }
                    if (x.filledToRoute === true) {
                        DebugUtil.info("已经填充到路由，不再填充到 query");
                        return false;
                    }
                    if (httpGet && !x.fromDefine) {
                        DebugUtil.info("get 操作且未定义任意参数描述符号:" + x.name);
                        return true;
                    }
                    if (x.fromDefine && x.fromDefine.IsFromQuery) {
                        DebugUtil.info("get 操作且定义 FromQuery描述符号:" + x.name);
                        return true;
                    }
                    return false;
                });
                return params.map((x) => {
                    x.filledToQuery = true;
                    if (typeof (x.value) === "string" || typeof (x.value) === "number" || typeof (x.value) === "boolean") {
                        return encodeURI(x.name) + "=" + encodeURI("" + x.value);
                    }
                    return encodeURI(x.name) + "=" + encodeURI(JSON.stringify(x.value));
                }).join("&");
            }
            return "";
        }
        /** 解析 routeArea 路由 并利用给定参数填充 */
        private static parceRouteArea(controlDefine: IControlOption, actionDefine: HongboRootAction): string {
            if (controlDefine.routeDefine && controlDefine.routeDefine.RouteAreaContent) {
                return RouteUtil.parceRouteTemplate(controlDefine.routeDefine.RouteAreaContent, controlDefine, actionDefine) + "/";
            }
            return "";
        }
        /** 解析 routePrefix 路由定义 */
        private static parceRoutePrefix(controlDefine: IControlOption, actionDefine: HongboRootAction): string {
            if (controlDefine && controlDefine.routeDefine && controlDefine.routeDefine.RoutePrefixDefine) { //
                return `${controlDefine.routeDefine.RoutePrefixDefine}` + "/";
            }
            return "";
        }

        /** 解析 action 上的 route 路由定义 */
        private static parceActionRoute(controlDefine: IControlOption, actionDefine: HongboRootAction): string {
            if (actionDefine.routeDefine && actionDefine.routeDefine.RouteContent) {
                return RouteUtil.parceRouteTemplate(actionDefine.routeDefine.RouteContent, controlDefine, actionDefine);
            }
            return "";
        }

        /** 解析 controller 上的 route 路由定义 */
        static parceControllerRoute(controlDefine: IControlOption, actionDefine: HongboRootAction): string {
            if (controlDefine.routeDefine && controlDefine.routeDefine.RouteContent) { // route defined in control
                return RouteUtil.parceRouteTemplate(controlDefine.routeDefine.RouteContent, controlDefine, actionDefine);
            }
            return "";
        }
        /** 解析 Route Template 模板字符串, 获取路由段定义数组
         *  并根据传入参数数组填充路由段的输入值，
         *  填充后将从传入参数数组中删除已经填充到路由段定义中的参数
         *  after this call,
         *  @param control the control define.
         *  @param actionDefine the action define, the inParameterDefines property will be used to replace the content in template
         *  @returns url , should replaced with paramter transfered to the action, and
         *                 suffix with the parameter which defined fromQuery attribute
         */
        public static parceRouteTemplate(template: string, control: IControlOption, actionDefine: HongboRootAction): string {
            let paramArray: IActionParameterDefine[] = actionDefine.inParameterDefines;
            const original: string = template;
            // replace the {controller} withc type of Control
            template = template.replace("{controller}", control.controlTypeName.replace("Controller", ""));
            DebugUtil.info(original, "after replace controller", template);
            // replace {action} with actionName or name of action.
            template = template.replace("{action}", actionDefine.actionName ? actionDefine.actionName : actionDefine.name);
            DebugUtil.info(original, "after replace action", template);
            let routes: string[] = template.split("/");
            let segments: RouteSegment[] = routes.map((x) => RouteUtil.parceRouteSegment(x, paramArray));
            for (let index: number = segments.length - 1; index >= 0; index--) {
                let segment: RouteSegment = segments[index];
                if (segment.isOptional && segment.defaultValue === undefined && segment.assignParamInfo === undefined) {
                    segments.splice(index, 1); // 可选参数未指定值时，删除此参数；
                }
            }
            let validSegments: RouteSegment[] = segments.filter((segment) => {
                if (segment.isFixed) {
                    return true;
                }
                // 无默认参数，且未传入参数值，此参数过滤掉，不拼凑到路由中
                if (segment.defaultValue === undefined && segment.assignParamInfo === undefined) {
                    return false;
                }
                return true;
            });
            let parcedUrl: string = validSegments.map((x) => {
                let param: IActionParameterDefine | undefined = x.assignParamInfo;
                if (param && param.value) { return param.value; } else { return x.defaultValue; }
            }).join("/");
            return parcedUrl;
        }
        /*** 解析某一个路由段字符串
         * {x:long=10}
         * {x?:long=10} //可选，默认为10
        */
        public static parceRouteSegment(segmentPath: string, paramArray: IActionParameterDefine[]): RouteSegment {
            if (segmentPath.startsWith("{")) {
                segmentPath = segmentPath.substring(1);
            } else {
                let fixsegment: RouteSegment = { name: segmentPath, defaultValue: segmentPath, isFixed: true };
                return fixsegment;
            }
            if (segmentPath.endsWith("}")) { segmentPath = segmentPath.substring(0, segmentPath.length - 1); }
            let contents: string[] = segmentPath.split("=");
            let prefix: string = contents[0];
            let isOptional: boolean = false;
            if (prefix.indexOf(":") >= 0) {
                prefix = prefix.substring(0, prefix.indexOf(":"));
            }
            prefix = prefix.trim();
            if (prefix.endsWith("?")) {
                isOptional = true;
                prefix = prefix.substring(0, prefix.length - 1);
            }
            let segment: RouteSegment = { name: "", isOptional: isOptional };
            segment.name = prefix;
            if (contents.length > 1) {  // the content after = will be the default value, maybe has bug when the is Refex constraint
                segment.defaultValue = contents[1];
            }
            let assignParamIndex: number = (paramArray ? paramArray : []).findIndex((x) => x.name === segment.name);
            if (assignParamIndex >= 0) {
                let assignParam: IActionParameterDefine = paramArray[assignParamIndex];
                assignParam.filledToRoute = true;
                segment.assignParamInfo = assignParam;
            }
            return segment;
        }
    }
}

Hongbo.HongboRootControl.BaseUrl = "http://localhost/TsGenAspnetExample";
Hongbo.HongboRootControl.DefaulWebapitRoute = "api/{controller}/{id?}";
Hongbo.HongboRootControl.DefaulMvctRoute = "{controller}/{action}/{id?}";
export namespace TsGenAspnetExample.Controllers {
    export class HomeController extends Hongbo.HongboRootControl {
        /** define a static instance of Constructor */
        public static Instance = new HomeController();

        /** define the constructor of HomeController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "HomeController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param dbContext without remark
         */
        static Index(): Promise<null | Entitys.TsGenAspnetExample.Models.Dog> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return HomeController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param dbContext without remark
         */
        static Welcome(): Promise<any> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return HomeController.Instance.callAction(actionInfo);
        }
    }
    export class TestRouteController extends Hongbo.HongboRootControl {
        /** define a static instance of Constructor */
        public static Instance = new TestRouteController();

        /** define the constructor of TestRouteController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "TestRouteController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {"RouteContent":"tr/{action}"}
            };
        }
        /** without remark */
        static Ask(): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return TestRouteController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         */
        static Hello(lang: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"hello","ActionNameContent":"h"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = lang;
            return TestRouteController.Instance.callAction(actionInfo);
        }
        /** without remark */
        static Index(): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return TestRouteController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         *   @param name without remark
         */
        static RootSay(lang: null | string,name: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"rsay/{name=daiwei}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"},{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = lang;
            actionInfo.inParameterDefines[1].value = name;
            return TestRouteController.Instance.callAction(actionInfo);
        }
    }
    export class TestRouteAreaAndRoutePrefixController extends Hongbo.HongboRootControl {
        /** define a static instance of Constructor */
        public static Instance = new TestRouteAreaAndRoutePrefixController();

        /** define the constructor of TestRouteAreaAndRoutePrefixController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "TestRouteAreaAndRoutePrefixController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {"RouteAreaContent":"{lang=zh-CN}/ra"}
            };
        }
        /** without remark
         *   @param lang without remark
         */
        static Hello(lang: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"hello","ActionNameContent":"h"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = lang;
            return TestRouteAreaAndRoutePrefixController.Instance.callAction(actionInfo);
        }
        /** without remark */
        static Index(): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return TestRouteAreaAndRoutePrefixController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         *   @param name without remark
         */
        static Say(lang: null | string,name: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"say/{name=daiwei}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"},{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = lang;
            actionInfo.inParameterDefines[1].value = name;
            return TestRouteAreaAndRoutePrefixController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         */
        static World(lang: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"ActionNameContent":"h"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = lang;
            return TestRouteAreaAndRoutePrefixController.Instance.callAction(actionInfo);
        }
    }
    export class TestRouteAreaController extends Hongbo.HongboRootControl {
        /** define a static instance of Constructor */
        public static Instance = new TestRouteAreaController();

        /** define the constructor of TestRouteAreaController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "TestRouteAreaController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {"RouteAreaContent":"{lang=zh-CN}/ra"}
            };
        }
        /** without remark
         *   @param lang without remark
         */
        static Hello(lang: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"hello"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = lang;
            return TestRouteAreaController.Instance.callAction(actionInfo);
        }
        /** without remark */
        static Index(): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return TestRouteAreaController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         *   @param name without remark
         */
        static RootSay(lang: null | string,name: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"rsay/{name=daiwei}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"},{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = lang;
            actionInfo.inParameterDefines[1].value = name;
            return TestRouteAreaController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         *   @param name without remark
         */
        static Say(lang: null | string,name: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"say/{name=daiwei}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"},{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = lang;
            actionInfo.inParameterDefines[1].value = name;
            return TestRouteAreaController.Instance.callAction(actionInfo);
        }
    }
    export class TestRoutePrefixController extends Hongbo.HongboRootControl {
        /** define a static instance of Constructor */
        public static Instance = new TestRoutePrefixController();

        /** define the constructor of TestRoutePrefixController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "TestRoutePrefixController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark */
        static Hello(): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"hello"};
            actionInfo.inParameterDefines = [];
            return TestRoutePrefixController.Instance.callAction(actionInfo);
        }
        /** without remark */
        static Index(): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return TestRoutePrefixController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param name without remark
         */
        static RootSay(name: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"rsay/{name=daiwei}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = name;
            return TestRoutePrefixController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param name without remark
         */
        static Say(name: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"say/{name=daiwei}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = name;
            return TestRoutePrefixController.Instance.callAction(actionInfo);
        }
    }
    export class NoAnyAttrWebapiController extends Hongbo.HongboRootControl {
        /** define a static instance of Constructor */
        public static Instance = new NoAnyAttrWebapiController();

        /** define the constructor of NoAnyAttrWebapiController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "NoAnyAttrWebapiController",
                controlMode: Hongbo.EnumControlMode.WebApi,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param id without remark
         */
        static Delete(id: number): Promise<null | Entitys.TsGenAspnetExample.Models.Person> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpDelete":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return NoAnyAttrWebapiController.Instance.callAction(actionInfo);
        }
        /** without remark */
        static get(): Promise<null | Entitys.TsGenAspnetExample.Models.Manager[]> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
            return NoAnyAttrWebapiController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        static Get(id: number): Promise<null | Entitys.TsGenAspnetExample.Models.Person> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return NoAnyAttrWebapiController.Instance.callAction(actionInfo);
        }
        /** without remark */
        static Options(): Promise<null | Entitys.TsGenAspnetExample.Models.Person> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpOptions":true};
            actionInfo.inParameterDefines = [];
            return NoAnyAttrWebapiController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param value without remark
         */
        // tslint:disable-next-line:max-line-length
        static Patch(id: number,value: null | Entitys.TsGenAspnetExample.Models.Person): Promise<null | Entitys.TsGenAspnetExample.Models.Person> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPatch":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = value;
            return NoAnyAttrWebapiController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param value without remark
         */
        static Post(value: null | Entitys.TsGenAspnetExample.Models.Person): Promise<null | Entitys.TsGenAspnetExample.Models.Person> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = value;
            return NoAnyAttrWebapiController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param value without remark
         */
        // tslint:disable-next-line:max-line-length
        static Put(id: number,value: null | Entitys.TsGenAspnetExample.Models.Person): Promise<null | Entitys.TsGenAspnetExample.Models.Person> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPut":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = value;
            return NoAnyAttrWebapiController.Instance.callAction(actionInfo);
        }
    }
    export class TestAreaTestPrefixValuesController extends Hongbo.HongboRootControl {
        /** define a static instance of Constructor */
        public static Instance = new TestAreaTestPrefixValuesController();

        /** define the constructor of TestAreaTestPrefixValuesController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "TestAreaTestPrefixValuesController",
                controlMode: Hongbo.EnumControlMode.WebApi,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param id without remark
         */
        static Delete(id: number): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpDelete":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return TestAreaTestPrefixValuesController.Instance.callAction(actionInfo);
        }
        /** without remark */
        static Get(): Promise<null | string[]> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
            return TestAreaTestPrefixValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        static GetById(id: number): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return TestAreaTestPrefixValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param value without remark
         */
        static Post(value: null | string): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = value;
            return TestAreaTestPrefixValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param value without remark
         */
        static Put(id: number,value: null | string): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPut":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = value;
            return TestAreaTestPrefixValuesController.Instance.callAction(actionInfo);
        }
    }
    export class TestPrefixValuesController extends Hongbo.HongboRootControl {
        /** define a static instance of Constructor */
        public static Instance = new TestPrefixValuesController();

        /** define the constructor of TestPrefixValuesController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "TestPrefixValuesController",
                controlMode: Hongbo.EnumControlMode.WebApi,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param id without remark
         */
        static Delete(id: number): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpDelete":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return TestPrefixValuesController.Instance.callAction(actionInfo);
        }
        /** without remark */
        static Get(): Promise<null | string[]> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
            return TestPrefixValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        static GetById(id: number): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return TestPrefixValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param value without remark
         */
        static Post(value: null | string): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = value;
            return TestPrefixValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param value without remark
         */
        static Put(id: number,value: null | string): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPut":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = value;
            return TestPrefixValuesController.Instance.callAction(actionInfo);
        }
    }
    export class NoRouteValuesController extends Hongbo.HongboRootControl {
        /** define a static instance of Constructor */
        public static Instance = new NoRouteValuesController();

        /** define the constructor of NoRouteValuesController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "NoRouteValuesController",
                controlMode: Hongbo.EnumControlMode.WebApi,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param id without remark
         */
        static Get(id: number): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return NoRouteValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         */
        static Test(lang: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = lang;
            return NoRouteValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param lang without remark
         */
        static TestByIdLang(id: number,lang: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = lang;
            return NoRouteValuesController.Instance.callAction(actionInfo);
        }
    }
    export class ValuesController extends Hongbo.HongboRootControl {
        /** define a static instance of Constructor */
        public static Instance = new ValuesController();

        /** define the constructor of ValuesController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "ValuesController",
                controlMode: Hongbo.EnumControlMode.WebApi,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param id without remark
         */
        static Get(id: number): Promise<null | string[]> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return ValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         */
        static Test(lang: null | string): Promise<Record<string,null | Entitys.TsGenAspnetExample.Models.Person>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = lang;
            return ValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param lang without remark
         */
        static TestByIdLang(id: number,lang: null | string): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = lang;
            return ValuesController.Instance.callAction(actionInfo);
        }
    }
    export class TestAreaValuesController extends Hongbo.HongboRootControl {
        /** define a static instance of Constructor */
        public static Instance = new TestAreaValuesController();

        /** define the constructor of TestAreaValuesController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "TestAreaValuesController",
                controlMode: Hongbo.EnumControlMode.WebApi,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param id without remark
         */
        static Delete(id: number): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpDelete":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return TestAreaValuesController.Instance.callAction(actionInfo);
        }
        /** without remark */
        static Get(): Promise<null | string[]> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
            return TestAreaValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        static GetById(id: number): Promise<null | string> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return TestAreaValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param value without remark
         */
        static Post(value: null | string): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = value;
            return TestAreaValuesController.Instance.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param value without remark
         */
        static Put(id: number,value: null | string): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPut":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = value;
            return TestAreaValuesController.Instance.callAction(actionInfo);
        }
    }
}
