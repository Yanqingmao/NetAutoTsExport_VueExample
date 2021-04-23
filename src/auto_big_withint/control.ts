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
export namespace Hongbo.WechatMvc {
    // tslint:disable-next-line:class-name
    export abstract class AbstractWechatControll extends Hongbo.HongboRootControl {

        /** define the constructor of AbstractWechatControll */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractWechatControll",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
}
export namespace Hongbo.WechatMvc.Littleapp {
    // tslint:disable-next-line:max-line-length & class-name
    export abstract class AbstractWechatLittleAppMessageController<TMessageContext,TMessageHandle> extends Hongbo.WechatMvc.AbstractWechatControll {

        /** define the constructor of AbstractWechatLittleAppMessageController`2 */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractWechatLittleAppMessageController`2",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param signature without remark
         *   @param timestamp without remark
         *   @param nonce without remark
         *   @param echostr without remark
         */
        // tslint:disable-next-line:max-line-length
        Get(signature: Entitys.Null_Or_String,timestamp: Entitys.Null_Or_String,nonce: Entitys.Null_Or_String,echostr: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"ActionNameContent":"Index"};
            actionInfo.httpMethod = {"IsHttpGet":true};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"signature"},{"fromDefine":{},"name":"timestamp"},{"fromDefine":{},"name":"nonce"},{"fromDefine":{},"name":"echostr"}];
            actionInfo.inParameterDefines[0].value = signature;
            actionInfo.inParameterDefines[1].value = timestamp;
            actionInfo.inParameterDefines[2].value = nonce;
            actionInfo.inParameterDefines[3].value = echostr;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param postModel without remark
         */
        // tslint:disable-next-line:max-line-length
        Post(postModel: Entitys.Null_Or_PostModelInSenparcWeixinWxOpenEntitiesRequest): Promise<Entitys.Null_Or_ActionResultInSystemWebMvc> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"ActionNameContent":"Index"};
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"postModel"}];
            actionInfo.inParameterDefines[0].value = postModel;
            return this.callAction(actionInfo);
        }
    }
}
export namespace EhayWebApi.Controllers {
    // tslint:disable-next-line:class-name
    export abstract class AbstractBaseController extends Hongbo.HongboRootControl {

        /** define the constructor of AbstractBaseController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractBaseController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param inputUserContext without remark
         */
        SetInputUserContext(inputUserContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"inputUserContext"}];
            actionInfo.inParameterDefines[0].value = inputUserContext;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export abstract class AbstractWechatMpController extends AbstractBaseController {

        /** define the constructor of AbstractWechatMpController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractWechatMpController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark */
        GetIntroductQrcodeUrl(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.Null_Or_String>>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param url without remark
         *   @param scope without remark
         */
        GetWechatAuthenUrl(url: Entitys.Null_Or_String,scope: Entitys.Senparc.Weixin.MP.OAuthScope): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"url"},{"fromDefine":{},"name":"scope"}];
            actionInfo.inParameterDefines[0].value = url;
            actionInfo.inParameterDefines[1].value = scope;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param shortUrl without remark
         *   @param fullUrl without remark
         */
        // tslint:disable-next-line:max-line-length
        productWeixinJssdkConfig(shortUrl: Entitys.Null_Or_String,fullUrl: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.Hongbo.Wechat.Jssdk.JSSdkConfigOption>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"shortUrl"},{"fromDefine":{},"name":"fullUrl"}];
            actionInfo.inParameterDefines[0].value = shortUrl;
            actionInfo.inParameterDefines[1].value = fullUrl;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class AbstractQuestionController extends AbstractBaseController {

        /** define the constructor of AbstractQuestionController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractQuestionController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:class-name
    export class Question24Controller extends AbstractQuestionController {

        /** define the constructor of Question24Controller */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "Question24Controller",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param complex without remark
         *   @param answer without remark
         */
        // tslint:disable-next-line:max-line-length
        Answer(complex: Entitys.Null_Or_QuestionId_UserIdInEhayWebApiControllers,answer: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"complex"},{"fromDefine":{},"name":"answer"}];
            actionInfo.inParameterDefines[0].value = complex;
            actionInfo.inParameterDefines[1].value = answer;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param complex without remark
         */
        // tslint:disable-next-line:max-line-length
        FreeViewAnswer(complex: Entitys.Null_Or_QuestionId_UserIdInEhayWebApiControllers): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"complex"}];
            actionInfo.inParameterDefines[0].value = complex;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param wechatUserId without remark
         *   @param difficult without remark
         */
        // tslint:disable-next-line:max-line-length
        Next(wechatUserId: Entitys.Null_Or_String,difficult: Entitys.Magic24_Model.EnumQuestionDifficult): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.QuestionInfo_UserId>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"wechatUserId"},{"fromDefine":{},"name":"difficult"}];
            actionInfo.inParameterDefines[0].value = wechatUserId;
            actionInfo.inParameterDefines[1].value = difficult;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param complex without remark
         */
        // tslint:disable-next-line:max-line-length
        PayedViewAnswer(complex: Entitys.Null_Or_QuestionId_UserIdInEhayWebApiControllers): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"complex"}];
            actionInfo.inParameterDefines[0].value = complex;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class QuestionLittleAppController extends Hongbo.WechatMvc.Littleapp.AbstractWechatLittleAppMessageController<Entitys.Null_Or_CustomerWxOpenMessageContextInHongboWechatLittleApp,Entitys.Null_Or_WechatLittleAppMessageHandleInHongboWechatMvcLittleapp> {

        /** define the constructor of QuestionLittleAppController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "QuestionLittleAppController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:class-name
    export class QuestionLittleAppWechatUserController extends AbstractQuestionController {

        /** define the constructor of QuestionLittleAppWechatUserController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "QuestionLittleAppWechatUserController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param plan without remark
         */
        // tslint:disable-next-line:max-line-length
        AuditSelfplatFormPublishPlan(plan: Entitys.Null_Or_EH_Zhongmeng_PlanInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"plan"}];
            actionInfo.inParameterDefines[0].value = plan;
            return this.callAction(actionInfo);
        }
        /** without remark */
        // tslint:disable-next-line:max-line-length
        CityAndDistrictAndBuilding(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.StringIdAndNameAndChild>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param keyForLittleappSession without remark
         *   @param encryptData without remark
         *   @param iv without remark
         */
        // tslint:disable-next-line:max-line-length
        DecodedUserinfo(keyForLittleappSession: Entitys.Null_Or_String,encryptData: Entitys.Null_Or_String,iv: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Wechat.WC_User>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"keyForLittleappSession"},{"fromDefine":{},"name":"encryptData"},{"fromDefine":{},"name":"iv"}];
            actionInfo.inParameterDefines[0].value = keyForLittleappSession;
            actionInfo.inParameterDefines[1].value = encryptData;
            actionInfo.inParameterDefines[2].value = iv;
            return this.callAction(actionInfo);
        }
        /** without remark */
        // tslint:disable-next-line:max-line-length
        GetIntroductQrcodeUrl(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.IntroductOtherWechatResult>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param type without remark
         */
        // tslint:disable-next-line:max-line-length
        InOrOut(type: Entitys.EhayModel.Models.EnumWcuserWalletInOutType): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Wechat.EH_UnionUser_WalletDetail>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"type"}];
            actionInfo.inParameterDefines[0].value = type;
            return this.callAction(actionInfo);
        }
        /** without remark */
        MediaQuery(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.EH_Media>>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param uploadedMediaArrayJson without remark
         *   @param name without remark
         */
        // tslint:disable-next-line:max-line-length
        MediaUpload(uploadedMediaArrayJson: Entitys.Null_Or_String,name: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.EH_Media>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"uploadedMediaArrayJson"},{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = uploadedMediaArrayJson;
            actionInfo.inParameterDefines[1].value = name;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xid without remark
         */
        PayForPublishPlan(xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = xid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xid without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryContentForAudit(xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.Zhongmeng_ContentForAudit>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = xid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param province without remark
         *   @param city without remark
         *   @param district without remark
         *   @param order without remark
         *   @param buildernameKey without remark
         *   @param companynameKey without remark
         *   @param addressKey without remark
         *   @param machineNames without remark
         *   @param longitude without remark
         *   @param latitude without remark
         *   @param pageIndex without remark
         *   @param pageSize without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryMachine(province: Entitys.Null_Or_String,city: Entitys.Null_Or_String,district: Entitys.Null_Or_String,order: Entitys.Null_Or_String,buildernameKey: Entitys.Null_Or_String,companynameKey: Entitys.Null_Or_String,addressKey: Entitys.Null_Or_String,machineNames: Entitys.Null_Or_String,longitude: Entitys.Null_Or_Number,latitude: Entitys.Null_Or_Number,pageIndex: number,pageSize: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.GenericPageDataResponse<Entitys.EhayWebApi.Controllers.IdAndNameAndAddressAndDistance>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"province"},{"fromDefine":{},"name":"city"},{"fromDefine":{},"name":"district"},{"fromDefine":{},"name":"order"},{"fromDefine":{},"name":"buildernameKey"},{"fromDefine":{},"name":"companynameKey"},{"fromDefine":{},"name":"addressKey"},{"fromDefine":{},"name":"machineNames"},{"fromDefine":{},"name":"longitude"},{"fromDefine":{},"name":"latitude"},{"fromDefine":{},"name":"pageIndex"},{"fromDefine":{},"name":"pageSize"}];
            actionInfo.inParameterDefines[0].value = province;
            actionInfo.inParameterDefines[1].value = city;
            actionInfo.inParameterDefines[2].value = district;
            actionInfo.inParameterDefines[3].value = order;
            actionInfo.inParameterDefines[4].value = buildernameKey;
            actionInfo.inParameterDefines[5].value = companynameKey;
            actionInfo.inParameterDefines[6].value = addressKey;
            actionInfo.inParameterDefines[7].value = machineNames;
            actionInfo.inParameterDefines[8].value = longitude;
            actionInfo.inParameterDefines[9].value = latitude;
            actionInfo.inParameterDefines[10].value = pageIndex;
            actionInfo.inParameterDefines[11].value = pageSize;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param orderXid without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryMediaPlan(orderXid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Controllers.SimpleOrderInfo>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"orderXid"}];
            actionInfo.inParameterDefines[0].value = orderXid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param keyForLittleappSession without remark
         *   @param xcode without remark
         *   @param enviromnentType without remark
         */
        // tslint:disable-next-line:max-line-length
        QuerySelfInfo(keyForLittleappSession: Entitys.Null_Or_String,xcode: Entitys.Null_Or_String,enviromnentType: Entitys.EhayWebApi.Controllers.EnumAdvlplatformType): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.SessionKeyAndWcuser>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"keyForLittleappSession"},{"fromDefine":{},"name":"xcode"},{"fromDefine":{},"name":"enviromnentType"}];
            actionInfo.inParameterDefines[0].value = keyForLittleappSession;
            actionInfo.inParameterDefines[1].value = xcode;
            actionInfo.inParameterDefines[2].value = enviromnentType;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param isTestOrder without remark
         *   @param orderXid without remark
         *   @param mediaXid without remark
         *   @param beginDate without remark
         *   @param endDate without remark
         *   @param xid without remark
         *   @param remark without remark
         */
        // tslint:disable-next-line:max-line-length
        SaveMediaPlan(isTestOrder: boolean,orderXid: Entitys.Null_Or_String,mediaXid: Entitys.Null_Or_String,beginDate: Entitys.Null_Or_String,endDate: Entitys.Null_Or_String,xid: Entitys.Null_Or_String,remark: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.SimpleOrderInfo>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"isTestOrder"},{"fromDefine":{},"name":"orderXid"},{"fromDefine":{},"name":"mediaXid"},{"fromDefine":{},"name":"beginDate"},{"fromDefine":{},"name":"endDate"},{"fromDefine":{},"name":"xid"},{"fromDefine":{},"name":"remark"}];
            actionInfo.inParameterDefines[0].value = isTestOrder;
            actionInfo.inParameterDefines[1].value = orderXid;
            actionInfo.inParameterDefines[2].value = mediaXid;
            actionInfo.inParameterDefines[3].value = beginDate;
            actionInfo.inParameterDefines[4].value = endDate;
            actionInfo.inParameterDefines[5].value = xid;
            actionInfo.inParameterDefines[6].value = remark;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param orderXid without remark
         */
        SubmitMediaPlan(orderXid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"orderXid"}];
            actionInfo.inParameterDefines[0].value = orderXid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param chargeMoney without remark
         */
        // tslint:disable-next-line:max-line-length
        WalletCharge(chargeMoney: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.WechatOrderPayInfo>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"chargeMoney"}];
            actionInfo.inParameterDefines[0].value = chargeMoney;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class QuestionWechatOrderController extends AbstractQuestionController {

        /** define the constructor of QuestionWechatOrderController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "QuestionWechatOrderController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param ids without remark
         */
        // tslint:disable-next-line:max-line-length
        BuildOrder(ids: Entitys.Null_Or_QuestionId_UserIdInEhayWebApiControllers): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.Hongbo.Wechat.Payinfo.WechatPayJsApiInfo>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"ids"}];
            actionInfo.inParameterDefines[0].value = ids;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param orderNumber without remark
         *   @param uniorderAttach without remark
         *   @param money without remark
         */
        // tslint:disable-next-line:max-line-length
        VerifyPaySuccessCallback(orderNumber: Entitys.Null_Or_String,uniorderAttach: Entitys.Null_Or_String,money: number): Promise<Entitys.Null_Or_String> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"orderNumber"},{"fromDefine":{},"name":"uniorderAttach"},{"fromDefine":{},"name":"money"}];
            actionInfo.inParameterDefines[0].value = orderNumber;
            actionInfo.inParameterDefines[1].value = uniorderAttach;
            actionInfo.inParameterDefines[2].value = money;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class ApkRuntimeConfigQueryController extends AbstractBaseController {

        /** define the constructor of ApkRuntimeConfigQueryController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "ApkRuntimeConfigQueryController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param typeName without remark
         *   @param queryParameter without remark
         */
        // tslint:disable-next-line:max-line-length
        Query(typeName: Entitys.Null_Or_String,queryParameter: Entitys.Null_Or_ApkRuntimeConfigController_ParameterInEhayWebApiControllers): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.ApkRuntimeConfig>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"typeName"},{"fromDefine":{},"name":"queryParameter"}];
            actionInfo.inParameterDefines[0].value = typeName;
            actionInfo.inParameterDefines[1].value = queryParameter;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class AdController extends AbstractBaseController {

        /** define the constructor of AdController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AdController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark */
        Get(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.EH_Media>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export abstract class AbstractAsyncBaseController extends Hongbo.HongboRootControl {

        /** define the constructor of AbstractAsyncBaseController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractAsyncBaseController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param inputUserContext without remark
         */
        SetInputUserContext(inputUserContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"inputUserContext"}];
            actionInfo.inParameterDefines[0].value = inputUserContext;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export abstract class AbstractAsyncRawDataController extends AbstractAsyncBaseController {

        /** define the constructor of AbstractAsyncRawDataController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractAsyncRawDataController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:class-name
    export class EpaylinksController extends AbstractAsyncRawDataController {

        /** define the constructor of EpaylinksController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "EpaylinksController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:class-name
    export class PartnerAdminController extends AbstractBaseController {

        /** define the constructor of PartnerAdminController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "PartnerAdminController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param idArray without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        AuditPartner(idArray: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"idArray"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = idArray;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param idArray without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        CreatePartnerWechatMpAppInstance(idArray: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"idArray"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = idArray;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param idArray without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        CreatePartnerWorkAppInstance(idArray: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"idArray"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = idArray;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param idArray without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        RegisterMachineDevelopMenu(idArray: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"idArray"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = idArray;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class ScreenTextController extends AbstractWechatMpController {

        /** define the constructor of ScreenTextController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "ScreenTextController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param id without remark
         */
        DeleteScreenText(id: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<boolean>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param to without remark
         *   @param content without remark
         */
        // tslint:disable-next-line:max-line-length
        InnerScreenText(to: Entitys.Null_Or_String,content: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"to"},{"fromDefine":{},"name":"content"}];
            actionInfo.inParameterDefines[0].value = to;
            actionInfo.inParameterDefines[1].value = content;
            return this.callAction(actionInfo);
        }
        /** without remark */
        QueryScreenText(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<any>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param openId without remark
         *   @param to without remark
         *   @param content without remark
         */
        // tslint:disable-next-line:max-line-length
        ScreenText(openId: Entitys.Null_Or_String,to: Entitys.Null_Or_String,content: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"openId"},{"fromDefine":{},"name":"to"},{"fromDefine":{},"name":"content"}];
            actionInfo.inParameterDefines[0].value = openId;
            actionInfo.inParameterDefines[1].value = to;
            actionInfo.inParameterDefines[2].value = content;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        ShowScreenText(id: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<boolean>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark */
        UploadScreenTextBackground(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class MachineUserModifyController extends AbstractWechatMpController {

        /** define the constructor of MachineUserModifyController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "MachineUserModifyController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param isCreate without remark
         */
        BuildPropClassArray(isCreate: boolean): Promise<Array<Entitys.Null_Or_String>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"isCreate"}];
            actionInfo.inParameterDefines[0].value = isCreate;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param cryptPartnerId without remark
         *   @param cryptDevelopUserId without remark
         *   @param apply without remark
         *   @param companyTypeNameArray without remark
         *   @param buildName without remark
         *   @param applyImage without remark
         *   @param machineType without remark
         *   @param rentType without remark
         *   @param rentBeginDate without remark
         *   @param rentDateType without remark
         *   @param rentDateLen without remark
         *   @param rentCapacity without remark
         */
        // tslint:disable-next-line:max-line-length
        Create(cryptPartnerId: Entitys.Null_Or_String,cryptDevelopUserId: Entitys.Null_Or_String,apply: Entitys.Null_Or_EH_DeviceApplyInEhayModelModels,companyTypeNameArray: Array<Entitys.Null_Or_String>,buildName: Entitys.Null_Or_String,applyImage: Array<Array<Entitys.EhayWebApi.Model.WechatImage>>,machineType: Entitys.Null_Or_String,rentType: Entitys.Null_Or_EnumMachineRentTypeInEhayModelModels,rentBeginDate: Entitys.Null_Or_Date,rentDateType: Entitys.Null_Or_EnumDateTypeOfRentByDateInEhayModelModels,rentDateLen: Entitys.Null_Or_Number,rentCapacity: Entitys.Null_Or_Number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cryptPartnerId"},{"fromDefine":{},"name":"cryptDevelopUserId"},{"fromDefine":{},"name":"apply"},{"fromDefine":{},"name":"companyTypeNameArray"},{"fromDefine":{},"name":"buildName"},{"fromDefine":{},"name":"applyImage"},{"fromDefine":{},"name":"machineType"},{"fromDefine":{},"name":"rentType"},{"fromDefine":{},"name":"rentBeginDate"},{"fromDefine":{},"name":"rentDateType"},{"fromDefine":{},"name":"rentDateLen"},{"fromDefine":{},"name":"rentCapacity"}];
            actionInfo.inParameterDefines[0].value = cryptPartnerId;
            actionInfo.inParameterDefines[1].value = cryptDevelopUserId;
            actionInfo.inParameterDefines[2].value = apply;
            actionInfo.inParameterDefines[3].value = companyTypeNameArray;
            actionInfo.inParameterDefines[4].value = buildName;
            actionInfo.inParameterDefines[5].value = applyImage;
            actionInfo.inParameterDefines[6].value = machineType;
            actionInfo.inParameterDefines[7].value = rentType;
            actionInfo.inParameterDefines[8].value = rentBeginDate;
            actionInfo.inParameterDefines[9].value = rentDateType;
            actionInfo.inParameterDefines[10].value = rentDateLen;
            actionInfo.inParameterDefines[11].value = rentCapacity;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param address without remark
         *   @param xyzapply without remark
         */
        // tslint:disable-next-line:max-line-length
        ParceAddress(address: Entitys.Null_Or_String,xyzapply: Entitys.Null_Or_EH_DeviceApplyInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.Null_Or_String>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"address"},{"fromDefine":{},"name":"xyzapply"}];
            actionInfo.inParameterDefines[0].value = address;
            actionInfo.inParameterDefines[1].value = xyzapply;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param wcuser without remark
         *   @param apply without remark
         *   @param companyTypeId without remark
         */
        // tslint:disable-next-line:max-line-length
        PostIntroduce(wcuser: Entitys.Null_Or_WC_UserInEhayModelWechat,apply: Entitys.Null_Or_EH_DeviceApplyInEhayModelModels,companyTypeId: Array<number>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"wcuser"},{"fromDefine":{},"name":"apply"},{"fromDefine":{},"name":"companyTypeId"}];
            actionInfo.inParameterDefines[0].value = wcuser;
            actionInfo.inParameterDefines[1].value = apply;
            actionInfo.inParameterDefines[2].value = companyTypeId;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param shortUrl without remark
         *   @param fullUrl without remark
         */
        // tslint:disable-next-line:max-line-length
        productWeixinJssdkConfig(shortUrl: Entitys.Null_Or_String,fullUrl: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.Hongbo.Wechat.Jssdk.JSSdkConfigOption>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"shortUrl"},{"fromDefine":{},"name":"fullUrl"}];
            actionInfo.inParameterDefines[0].value = shortUrl;
            actionInfo.inParameterDefines[1].value = fullUrl;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param idCrypt without remark
         *   @param apply without remark
         *   @param companyTypeNameArray without remark
         *   @param buildingName without remark
         */
        // tslint:disable-next-line:max-line-length
        Set(idCrypt: Entitys.Null_Or_GenericIdAndXidEntityInHongboEfsafeBasic<Entitys.EhayModel.Models.EH_DeviceApply>,apply: Entitys.Null_Or_EH_DeviceApplyInEhayModelModels,companyTypeNameArray: Array<Entitys.Null_Or_String>,buildingName: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"idCrypt"},{"fromDefine":{},"name":"apply"},{"fromDefine":{},"name":"companyTypeNameArray"},{"fromDefine":{},"name":"buildingName"}];
            actionInfo.inParameterDefines[0].value = idCrypt;
            actionInfo.inParameterDefines[1].value = apply;
            actionInfo.inParameterDefines[2].value = companyTypeNameArray;
            actionInfo.inParameterDefines[3].value = buildingName;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class PlaySchemaViewController extends AbstractBaseController {

        /** define the constructor of PlaySchemaViewController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "PlaySchemaViewController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param cryptMachineId without remark
         *   @param cryptDeviceApplyId without remark
         *   @param pressWater without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryOverGlobal(cryptMachineId: Entitys.Null_Or_String,cryptDeviceApplyId: Entitys.Null_Or_String,pressWater: Entitys.EhayLogModel.EnumPressWaterType): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<boolean>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cryptMachineId"},{"fromDefine":{},"name":"cryptDeviceApplyId"},{"fromDefine":{},"name":"pressWater"}];
            actionInfo.inParameterDefines[0].value = cryptMachineId;
            actionInfo.inParameterDefines[1].value = cryptDeviceApplyId;
            actionInfo.inParameterDefines[2].value = pressWater;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param cryptDeviceId without remark
         *   @param cryptDeviceApplyId without remark
         *   @param cryptMachineId without remark
         *   @param pressType without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryPlaySchema(cryptDeviceId: Entitys.Null_Or_String,cryptDeviceApplyId: Entitys.Null_Or_String,cryptMachineId: Entitys.Null_Or_String,pressType: Entitys.EhayLogModel.EnumPressWaterType): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.PlaySchemaFullItemGroup>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cryptDeviceId"},{"fromDefine":{},"name":"cryptDeviceApplyId"},{"fromDefine":{},"name":"cryptMachineId"},{"fromDefine":{},"name":"pressType"}];
            actionInfo.inParameterDefines[0].value = cryptDeviceId;
            actionInfo.inParameterDefines[1].value = cryptDeviceApplyId;
            actionInfo.inParameterDefines[2].value = cryptMachineId;
            actionInfo.inParameterDefines[3].value = pressType;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class AdvplatformController extends AbstractBaseController {

        /** define the constructor of AdvplatformController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AdvplatformController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param plan without remark
         */
        // tslint:disable-next-line:max-line-length
        AuditSelfplatFormPublishPlan(plan: Entitys.Null_Or_EH_Zhongmeng_PlanInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"plan"}];
            actionInfo.inParameterDefines[0].value = plan;
            return this.callAction(actionInfo);
        }
        /** without remark */
        // tslint:disable-next-line:max-line-length
        CityAndDistrictAndBuilding(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.StringIdAndNameAndChild>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param keyForLittleappSession without remark
         *   @param encryptData without remark
         *   @param iv without remark
         */
        // tslint:disable-next-line:max-line-length
        DecodedUserinfo(keyForLittleappSession: Entitys.Null_Or_String,encryptData: Entitys.Null_Or_String,iv: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Wechat.WC_User>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"keyForLittleappSession"},{"fromDefine":{},"name":"encryptData"},{"fromDefine":{},"name":"iv"}];
            actionInfo.inParameterDefines[0].value = keyForLittleappSession;
            actionInfo.inParameterDefines[1].value = encryptData;
            actionInfo.inParameterDefines[2].value = iv;
            return this.callAction(actionInfo);
        }
        /** without remark */
        // tslint:disable-next-line:max-line-length
        GetIntroductQrcodeUrl(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.IntroductOtherWechatResult>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param type without remark
         */
        // tslint:disable-next-line:max-line-length
        InOrOut(type: Entitys.EhayModel.Models.EnumWcuserWalletInOutType): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Wechat.EH_UnionUser_WalletDetail>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"type"}];
            actionInfo.inParameterDefines[0].value = type;
            return this.callAction(actionInfo);
        }
        /** without remark */
        MediaQuery(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.EH_Media>>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param uploadedMediaArrayJson without remark
         *   @param name without remark
         */
        // tslint:disable-next-line:max-line-length
        MediaUpload(uploadedMediaArrayJson: Entitys.Null_Or_String,name: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.EH_Media>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"uploadedMediaArrayJson"},{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = uploadedMediaArrayJson;
            actionInfo.inParameterDefines[1].value = name;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xid without remark
         */
        PayForPublishPlan(xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = xid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xid without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryContentForAudit(xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.Zhongmeng_ContentForAudit>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = xid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param province without remark
         *   @param city without remark
         *   @param district without remark
         *   @param order without remark
         *   @param buildernameKey without remark
         *   @param companynameKey without remark
         *   @param addressKey without remark
         *   @param machineNames without remark
         *   @param longitude without remark
         *   @param latitude without remark
         *   @param pageIndex without remark
         *   @param pageSize without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryMachine(province: Entitys.Null_Or_String,city: Entitys.Null_Or_String,district: Entitys.Null_Or_String,order: Entitys.Null_Or_String,buildernameKey: Entitys.Null_Or_String,companynameKey: Entitys.Null_Or_String,addressKey: Entitys.Null_Or_String,machineNames: Entitys.Null_Or_String,longitude: Entitys.Null_Or_Number,latitude: Entitys.Null_Or_Number,pageIndex: number,pageSize: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.GenericPageDataResponse<Entitys.EhayWebApi.Controllers.IdAndNameAndAddressAndDistance>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"province"},{"fromDefine":{},"name":"city"},{"fromDefine":{},"name":"district"},{"fromDefine":{},"name":"order"},{"fromDefine":{},"name":"buildernameKey"},{"fromDefine":{},"name":"companynameKey"},{"fromDefine":{},"name":"addressKey"},{"fromDefine":{},"name":"machineNames"},{"fromDefine":{},"name":"longitude"},{"fromDefine":{},"name":"latitude"},{"fromDefine":{},"name":"pageIndex"},{"fromDefine":{},"name":"pageSize"}];
            actionInfo.inParameterDefines[0].value = province;
            actionInfo.inParameterDefines[1].value = city;
            actionInfo.inParameterDefines[2].value = district;
            actionInfo.inParameterDefines[3].value = order;
            actionInfo.inParameterDefines[4].value = buildernameKey;
            actionInfo.inParameterDefines[5].value = companynameKey;
            actionInfo.inParameterDefines[6].value = addressKey;
            actionInfo.inParameterDefines[7].value = machineNames;
            actionInfo.inParameterDefines[8].value = longitude;
            actionInfo.inParameterDefines[9].value = latitude;
            actionInfo.inParameterDefines[10].value = pageIndex;
            actionInfo.inParameterDefines[11].value = pageSize;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param orderXid without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryMediaPlan(orderXid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Controllers.SimpleOrderInfo>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"orderXid"}];
            actionInfo.inParameterDefines[0].value = orderXid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param keyForLittleappSession without remark
         *   @param xcode without remark
         *   @param enviromnentType without remark
         */
        // tslint:disable-next-line:max-line-length
        QuerySelfInfo(keyForLittleappSession: Entitys.Null_Or_String,xcode: Entitys.Null_Or_String,enviromnentType: Entitys.EhayWebApi.Controllers.EnumAdvlplatformType): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.SessionKeyAndWcuser>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"keyForLittleappSession"},{"fromDefine":{},"name":"xcode"},{"fromDefine":{},"name":"enviromnentType"}];
            actionInfo.inParameterDefines[0].value = keyForLittleappSession;
            actionInfo.inParameterDefines[1].value = xcode;
            actionInfo.inParameterDefines[2].value = enviromnentType;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param isTestOrder without remark
         *   @param orderXid without remark
         *   @param mediaXid without remark
         *   @param beginDate without remark
         *   @param endDate without remark
         *   @param xid without remark
         *   @param remark without remark
         */
        // tslint:disable-next-line:max-line-length
        SaveMediaPlan(isTestOrder: boolean,orderXid: Entitys.Null_Or_String,mediaXid: Entitys.Null_Or_String,beginDate: Entitys.Null_Or_String,endDate: Entitys.Null_Or_String,xid: Entitys.Null_Or_String,remark: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.SimpleOrderInfo>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"isTestOrder"},{"fromDefine":{},"name":"orderXid"},{"fromDefine":{},"name":"mediaXid"},{"fromDefine":{},"name":"beginDate"},{"fromDefine":{},"name":"endDate"},{"fromDefine":{},"name":"xid"},{"fromDefine":{},"name":"remark"}];
            actionInfo.inParameterDefines[0].value = isTestOrder;
            actionInfo.inParameterDefines[1].value = orderXid;
            actionInfo.inParameterDefines[2].value = mediaXid;
            actionInfo.inParameterDefines[3].value = beginDate;
            actionInfo.inParameterDefines[4].value = endDate;
            actionInfo.inParameterDefines[5].value = xid;
            actionInfo.inParameterDefines[6].value = remark;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param orderXid without remark
         */
        SubmitMediaPlan(orderXid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"orderXid"}];
            actionInfo.inParameterDefines[0].value = orderXid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param chargeMoney without remark
         */
        // tslint:disable-next-line:max-line-length
        WalletCharge(chargeMoney: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.WechatOrderPayInfo>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"chargeMoney"}];
            actionInfo.inParameterDefines[0].value = chargeMoney;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class XiansotongController extends AbstractAsyncBaseController {

        /** define the constructor of XiansotongController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "XiansotongController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:class-name
    export class ChartDataController extends AbstractBaseController {

        /** define the constructor of ChartDataController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "ChartDataController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param chartType without remark
         */
        // tslint:disable-next-line:max-line-length
        ChartData(chartType: Entitys.EhayWebApi.Controllers.EnumChartDataType): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.Chart_SerialDefine>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"chartType"}];
            actionInfo.inParameterDefines[0].value = chartType;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class DeviceController extends AbstractAsyncBaseController {

        /** define the constructor of DeviceController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "DeviceController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param guid without remark
         *   @param content without remark
         */
        // tslint:disable-next-line:max-line-length
        ConvertBaiduUrl(guid: Entitys.Null_Or_String,content: Entitys.Null_Or_String): Promise<Entitys.Null_Or_JsonOperResultInEhayModelModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"cbu/{guid}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"content"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = content;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param deviceGuid without remark
         *   @param mediaGuid without remark
         *   @param clientGuid without remark
         *   @param logoImageId without remark
         *   @param logoImageUrl without remark
         *   @param targetImageId without remark
         *   @param targetUrl without remark
         */
        // tslint:disable-next-line:max-line-length
        DeviceContentClick(deviceGuid: Entitys.Null_Or_String,mediaGuid: Entitys.Null_Or_String,clientGuid: Entitys.Null_Or_String,logoImageId: number,logoImageUrl: Entitys.Null_Or_String,targetImageId: Entitys.Null_Or_Number,targetUrl: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"dcc"};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"deviceGuid"},{"fromDefine":{},"name":"mediaGuid"},{"fromDefine":{},"name":"clientGuid"},{"fromDefine":{},"name":"logoImageId"},{"fromDefine":{},"name":"logoImageUrl"},{"fromDefine":{},"name":"targetImageId"},{"fromDefine":{},"name":"targetUrl"}];
            actionInfo.inParameterDefines[0].value = deviceGuid;
            actionInfo.inParameterDefines[1].value = mediaGuid;
            actionInfo.inParameterDefines[2].value = clientGuid;
            actionInfo.inParameterDefines[3].value = logoImageId;
            actionInfo.inParameterDefines[4].value = logoImageUrl;
            actionInfo.inParameterDefines[5].value = targetImageId;
            actionInfo.inParameterDefines[6].value = targetUrl;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         */
        // tslint:disable-next-line:max-line-length
        DownloadDirectiveList(guid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_JsonOperResult_1InEhayModelModels<Array<Entitys.EhayWebApi.Model.BoardControll.DeviceHeart.DirectiveContentInfo>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"DDL/{guid}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"}];
            actionInfo.inParameterDefines[0].value = guid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         *   @param ip without remark
         */
        GetBackgroundCheckUpgradeUrlAsync(guid: Entitys.Null_Or_String,ip: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"G/{guid?}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"ip"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = ip;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         *   @param ip without remark
         */
        GetCheckUpgradeUrlAsync(guid: Entitys.Null_Or_String,ip: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"U/{guid?}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"ip"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = ip;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param apkType without remark
         *   @param fileTicks without remark
         *   @param guid without remark
         *   @param ip without remark
         */
        // tslint:disable-next-line:max-line-length
        GetCheckUpgradeUrlContent(apkType: Entitys.EhayModel.Models.EnumApkType,fileTicks: number,guid: Entitys.Null_Or_String,ip: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"X/{apkType}/{fileTicks}/{guid?}/"};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"apkType"},{"fromDefine":{},"name":"fileTicks"},{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"ip"}];
            actionInfo.inParameterDefines[0].value = apkType;
            actionInfo.inParameterDefines[1].value = fileTicks;
            actionInfo.inParameterDefines[2].value = guid;
            actionInfo.inParameterDefines[3].value = ip;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         *   @param ip without remark
         */
        GetCheckUpgradSdkeUrlAsync(guid: Entitys.Null_Or_String,ip: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"S/{guid?}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"ip"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = ip;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param heartRequest without remark
         */
        // tslint:disable-next-line:max-line-length
        HeartAsync(heartRequest: Entitys.Null_Or_DeviceHeartRequestInEhayWebApiModel): Promise<Entitys.Null_Or_JsonOperResultInEhayModelModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"H/{guid}/{version?}/{longitude=0}/{latitude=0}/{wifiOr3G=0:range(0,1)}/{iccid?}/{name?}/{random?}/"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"heartRequest"}];
            actionInfo.inParameterDefines[0].value = heartRequest;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         *   @param serverTimeInLastHeartResponse without remark
         *   @param random without remark
         */
        // tslint:disable-next-line:max-line-length
        HeartCompleteAsync(guid: Entitys.Null_Or_String,serverTimeInLastHeartResponse: number,random: Entitys.Null_Or_String): Promise<Entitys.Null_Or_JsonOperResultInEhayModelModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"J/{guid}/{serverTimeInLastHeartResponse}/{random?}"};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"serverTimeInLastHeartResponse"},{"fromDefine":{},"name":"random"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = serverTimeInLastHeartResponse;
            actionInfo.inParameterDefines[2].value = random;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         *   @param randomInt without remark
         *   @param randomString without remark
         *   @param isUdp without remark
         */
        // tslint:disable-next-line:max-line-length
        MaintainNetwork(guid: Entitys.Null_Or_String,randomInt: number,randomString: Entitys.Null_Or_String,isUdp: boolean): Promise<Entitys.Null_Or_String> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"I/{guid}/{randomInt=0}/{randomString=null}/"};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"randomInt"},{"fromDefine":{},"name":"randomString"},{"fromDefine":{},"name":"isUdp"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = randomInt;
            actionInfo.inParameterDefines[2].value = randomString;
            actionInfo.inParameterDefines[3].value = isUdp;
            return this.callAction(actionInfo);
        }
        /** without remark */
        NotifyDirectiveComplete(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"NDC/{guid}/{maxId}/{waterType}/"};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param termType without remark
         */
        QueryTimeRange(termType: Entitys.EhayModel.Models.EnumWeekType): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"Q/{termType}/"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"termType"}];
            actionInfo.inParameterDefines[0].value = termType;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         *   @param refreshLoopType without remark
         *   @param waterType without remark
         */
        // tslint:disable-next-line:max-line-length
        RefreshContentAsync(guid: Entitys.Null_Or_String,refreshLoopType: Entitys.EhayModel.Models.EnumWeekType,waterType: Entitys.EhayLogModel.EnumPressWaterType): Promise<Entitys.Null_Or_String> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"C/{guid}/{refreshLoopType}/{waterType}/"};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"refreshLoopType"},{"fromDefine":{},"name":"waterType"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = refreshLoopType;
            actionInfo.inParameterDefines[2].value = waterType;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         *   @param refreshLoopType without remark
         *   @param waterType without remark
         *   @param contentLastRefreshDatetime without remark
         *   @param random without remark
         */
        // tslint:disable-next-line:max-line-length
        RefreshContentCompleteAsync(guid: Entitys.Null_Or_String,refreshLoopType: Entitys.EhayModel.Models.EnumWeekType,waterType: Entitys.EhayLogModel.EnumPressWaterType,contentLastRefreshDatetime: Entitys.Null_Or_Number,random: Entitys.Null_Or_String): Promise<Entitys.Null_Or_JsonOperResultInEhayModelModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"T/{guid}/{refreshLoopType}/{waterType}/{contentLastRefreshDatetime?}/{random?}"};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"refreshLoopType"},{"fromDefine":{},"name":"waterType"},{"fromDefine":{},"name":"contentLastRefreshDatetime"},{"fromDefine":{},"name":"random"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = refreshLoopType;
            actionInfo.inParameterDefines[2].value = waterType;
            actionInfo.inParameterDefines[3].value = contentLastRefreshDatetime;
            actionInfo.inParameterDefines[4].value = random;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         *   @param random without remark
         */
        // tslint:disable-next-line:max-line-length
        RefreshParameterAsync(guid: Entitys.Null_Or_String,random: Entitys.Null_Or_String): Promise<Entitys.Null_Or_JsonOperResultInEhayModelModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"P/{guid}/{random?}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"random"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = random;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param deviceInfo without remark
         *   @param Longitude without remark
         *   @param Latitude without remark
         */
        // tslint:disable-next-line:max-line-length
        RegisterAsync(deviceInfo: Entitys.Null_Or_EH_DeviceInfoInEhayModelModels,Longitude: Entitys.Null_Or_Number,Latitude: Entitys.Null_Or_Number): Promise<Entitys.Null_Or_JsonOperResultInEhayModelModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"R/{MacAddress}/{IMEI}/{Longitude=0}/{Latitude=0}/"};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"deviceInfo"},{"fromDefine":{},"name":"Longitude"},{"fromDefine":{},"name":"Latitude"}];
            actionInfo.inParameterDefines[0].value = deviceInfo;
            actionInfo.inParameterDefines[1].value = Longitude;
            actionInfo.inParameterDefines[2].value = Latitude;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param appid without remark
         *   @param imei without remark
         *   @param macAddress without remark
         *   @param machineName without remark
         *   @param sign without remark
         */
        // tslint:disable-next-line:max-line-length
        SdkRegisterAsync(appid: Entitys.Null_Or_String,imei: Entitys.Null_Or_String,macAddress: Entitys.Null_Or_String,machineName: Entitys.Null_Or_String,sign: Entitys.Null_Or_String): Promise<Entitys.Null_Or_JsonOperResultInEhayModelModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"SR/{appid}/{imei}/{macAddress}/{machineName}/{sign}"};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"appid"},{"fromDefine":{},"name":"imei"},{"fromDefine":{},"name":"macAddress"},{"fromDefine":{},"name":"machineName"},{"fromDefine":{},"name":"sign"}];
            actionInfo.inParameterDefines[0].value = appid;
            actionInfo.inParameterDefines[1].value = imei;
            actionInfo.inParameterDefines[2].value = macAddress;
            actionInfo.inParameterDefines[3].value = machineName;
            actionInfo.inParameterDefines[4].value = sign;
            return this.callAction(actionInfo);
        }
        /** without remark */
        Test(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"test"};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         *   @param random without remark
         */
        // tslint:disable-next-line:max-line-length
        UpdateWifiAsync(guid: Entitys.Null_Or_String,random: Entitys.Null_Or_String): Promise<Entitys.Null_Or_JsonOperResultInEhayModelModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"W/{guid}/{random?}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"random"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = random;
            return this.callAction(actionInfo);
        }
        /** without remark */
        UploadDirective(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         *   @param content without remark
         *   @param random without remark
         */
        // tslint:disable-next-line:max-line-length
        UploadParameter(guid: Entitys.Null_Or_String,content: Entitys.Null_Or_String,random: Entitys.Null_Or_String): Promise<Entitys.Null_Or_JsonOperResultInEhayModelModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"UploadParameter/{guid}/{random?}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"content"},{"fromDefine":{},"name":"random"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = content;
            actionInfo.inParameterDefines[2].value = random;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         *   @param originalTds without remark
         *   @param filteredTds without remark
         *   @param originalTemp without remark
         *   @param hotWaterTemp without remark
         *   @param errorCode without remark
         *   @param machineStatus without remark
         *   @param isUdp without remark
         */
        // tslint:disable-next-line:max-line-length
        UploadTds(guid: Entitys.Null_Or_String,originalTds: number,filteredTds: number,originalTemp: number,hotWaterTemp: number,errorCode: number,machineStatus: number,isUdp: boolean): Promise<Entitys.Null_Or_String> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"D/{guid}/{originalTds=-1}/{filteredTds=-1}/{originalTemp=-1}/{hotWaterTemp=-1}/{errorCode=-1}/{machineStatus=-1}/"};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"originalTds"},{"fromDefine":{},"name":"filteredTds"},{"fromDefine":{},"name":"originalTemp"},{"fromDefine":{},"name":"hotWaterTemp"},{"fromDefine":{},"name":"errorCode"},{"fromDefine":{},"name":"machineStatus"},{"fromDefine":{},"name":"isUdp"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = originalTds;
            actionInfo.inParameterDefines[2].value = filteredTds;
            actionInfo.inParameterDefines[3].value = originalTemp;
            actionInfo.inParameterDefines[4].value = hotWaterTemp;
            actionInfo.inParameterDefines[5].value = errorCode;
            actionInfo.inParameterDefines[6].value = machineStatus;
            actionInfo.inParameterDefines[7].value = isUdp;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param guid without remark
         *   @param content without remark
         *   @param platformType without remark
         */
        // tslint:disable-next-line:max-line-length
        UploadZmPlayLog(guid: Entitys.Null_Or_String,content: Entitys.Null_Or_String,platformType: Entitys.EhayModel.Models.EnumCooperateRtbPlatformType): Promise<Entitys.Null_Or_JsonOperResultInEhayModelModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"zm/{guid}/"};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"content"},{"fromDefine":{},"name":"platformType"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = content;
            actionInfo.inParameterDefines[2].value = platformType;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class EntityOperateController extends AbstractBaseController {

        /** define the constructor of EntityOperateController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "EntityOperateController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param entityTypeName without remark
         *   @param operatePath without remark
         *   @param ids without remark
         *   @param otherInputParameter without remark
         */
        // tslint:disable-next-line:max-line-length
        Operate(entityTypeName: Entitys.Null_Or_String,operatePath: Entitys.Null_Or_String,ids: Array<Entitys.Null_Or_String>,otherInputParameter: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"},{"fromDefine":{},"name":"operatePath"},{"fromDefine":{},"name":"ids"},{"fromDefine":{},"name":"otherInputParameter"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            actionInfo.inParameterDefines[1].value = operatePath;
            actionInfo.inParameterDefines[2].value = ids;
            actionInfo.inParameterDefines[3].value = otherInputParameter;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class EntityTypeVueDefineController extends AbstractBaseController {

        /** define the constructor of EntityTypeVueDefineController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "EntityTypeVueDefineController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param entityTypeName without remark
         *   @param onlyEdit without remark
         */
        // tslint:disable-next-line:max-line-length
        GetEntityTypeVueDefine(entityTypeName: Entitys.Null_Or_String,onlyEdit: boolean): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.hongbao.Vue.ElementUi.EntityTypeVueDefine>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"},{"fromDefine":{},"name":"onlyEdit"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            actionInfo.inParameterDefines[1].value = onlyEdit;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class EntityQueryController extends AbstractBaseController {

        /** define the constructor of EntityQueryController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "EntityQueryController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param entityTypeName without remark
         *   @param filterContentJson without remark
         *   @param routeName without remark
         */
        // tslint:disable-next-line:max-line-length
        ExportData(entityTypeName: Entitys.Null_Or_String,filterContentJson: Entitys.Null_Or_String,routeName: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"},{"fromDefine":{},"name":"filterContentJson"},{"fromDefine":{},"name":"routeName"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            actionInfo.inParameterDefines[1].value = filterContentJson;
            actionInfo.inParameterDefines[2].value = routeName;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param entityTypeName without remark
         *   @param parentEntityId without remark
         *   @param filterContentJson without remark
         *   @param orderProp without remark
         *   @param isDesc without remark
         *   @param pageIndex without remark
         *   @param pageSize without remark
         *   @param xentityId without remark
         *   @param filterStates without remark
         */
        // tslint:disable-next-line:max-line-length
        GetEntityList(entityTypeName: Entitys.Null_Or_String,parentEntityId: Entitys.Null_Or_String,filterContentJson: Entitys.Null_Or_String,orderProp: Entitys.Null_Or_String,isDesc: boolean,pageIndex: number,pageSize: number,xentityId: Entitys.Null_Or_String,filterStates: Array<number>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.PageDataResponse>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"},{"fromDefine":{},"name":"parentEntityId"},{"fromDefine":{},"name":"filterContentJson"},{"fromDefine":{},"name":"orderProp"},{"fromDefine":{},"name":"isDesc"},{"fromDefine":{},"name":"pageIndex"},{"fromDefine":{},"name":"pageSize"},{"fromDefine":{},"name":"xentityId"},{"fromDefine":{},"name":"filterStates"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            actionInfo.inParameterDefines[1].value = parentEntityId;
            actionInfo.inParameterDefines[2].value = filterContentJson;
            actionInfo.inParameterDefines[3].value = orderProp;
            actionInfo.inParameterDefines[4].value = isDesc;
            actionInfo.inParameterDefines[5].value = pageIndex;
            actionInfo.inParameterDefines[6].value = pageSize;
            actionInfo.inParameterDefines[7].value = xentityId;
            actionInfo.inParameterDefines[8].value = filterStates;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param entityTypeName without remark
         *   @param entityId without remark
         */
        // tslint:disable-next-line:max-line-length
        GetEntityListById(entityTypeName: Entitys.Null_Or_String,entityId: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.hongbao.Vue.ElementUi.elmentui_option_stringvalue>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"},{"fromDefine":{},"name":"entityId"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            actionInfo.inParameterDefines[1].value = entityId;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param entityTypeName without remark
         *   @param entityKey without remark
         *   @param parentEntityId without remark
         *   @param entitiFilterConditionJson without remark
         *   @param containsDelete without remark
         *   @param rowCount without remark
         */
        // tslint:disable-next-line:max-line-length
        GetOptionsListByKey(entityTypeName: Entitys.Null_Or_String,entityKey: Entitys.Null_Or_String,parentEntityId: Entitys.Null_Or_String,entitiFilterConditionJson: Entitys.Null_Or_String,containsDelete: boolean,rowCount: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.hongbao.Vue.ElementUi.elmentui_option_stringvalue>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"},{"fromDefine":{},"name":"entityKey"},{"fromDefine":{},"name":"parentEntityId"},{"fromDefine":{},"name":"entitiFilterConditionJson"},{"fromDefine":{},"name":"containsDelete"},{"fromDefine":{},"name":"rowCount"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            actionInfo.inParameterDefines[1].value = entityKey;
            actionInfo.inParameterDefines[2].value = parentEntityId;
            actionInfo.inParameterDefines[3].value = entitiFilterConditionJson;
            actionInfo.inParameterDefines[4].value = containsDelete;
            actionInfo.inParameterDefines[5].value = rowCount;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param entityTypeName without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryTree(entityTypeName: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.hongbao.Vue.ElementUi.elmentui_option_stringvalue>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class EntityModifyController extends AbstractBaseController {

        /** define the constructor of EntityModifyController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "EntityModifyController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param entityTypeName without remark
         *   @param xid without remark
         */
        // tslint:disable-next-line:max-line-length
        DeleteEntity(entityTypeName: Entitys.Null_Or_String,xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"},{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            actionInfo.inParameterDefines[1].value = xid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param entityTypeName without remark
         *   @param parentEntityId without remark
         *   @param editContentJson without remark
         */
        // tslint:disable-next-line:max-line-length
        SaveEntity(entityTypeName: Entitys.Null_Or_String,parentEntityId: Entitys.Null_Or_String,editContentJson: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<any>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"},{"fromDefine":{},"name":"parentEntityId"},{"fromDefine":{},"name":"editContentJson"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            actionInfo.inParameterDefines[1].value = parentEntityId;
            actionInfo.inParameterDefines[2].value = editContentJson;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class MachineOrDevicePlayQueryController extends AbstractBaseController {

        /** define the constructor of MachineOrDevicePlayQueryController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "MachineOrDevicePlayQueryController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param isQueryMachine without remark
         *   @param queryCurrentMonth without remark
         *   @param xid without remark
         */
        // tslint:disable-next-line:max-line-length
        PlayDetail(isQueryMachine: boolean,queryCurrentMonth: boolean,xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.DevicePlayDetail>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"isQueryMachine"},{"fromDefine":{},"name":"queryCurrentMonth"},{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = isQueryMachine;
            actionInfo.inParameterDefines[1].value = queryCurrentMonth;
            actionInfo.inParameterDefines[2].value = xid;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class AbstractMachineOrDeviceQueryController<TQueryParameter,KMachineOrBoard> extends AbstractBaseController {

        /** define the constructor of AbstractMachineOrDeviceQueryController`2 */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractMachineOrDeviceQueryController`2",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param request without remark
         */
        Export(request: TQueryParameter): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"request"}];
            actionInfo.inParameterDefines[0].value = request;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param request without remark
         */
        // tslint:disable-next-line:max-line-length
        Index(request: TQueryParameter): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.GenericPageDataResponse<Entitys.EhayWebApi.Model.MachineOrBoardQueryResponse>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"request"}];
            actionInfo.inParameterDefines[0].value = request;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param request without remark
         */
        // tslint:disable-next-line:max-line-length
        IndexForMap(request: TQueryParameter): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.DeviceQueryForMapResponse>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"request"}];
            actionInfo.inParameterDefines[0].value = request;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class MachineQueryController extends AbstractMachineOrDeviceQueryController<Entitys.Null_Or_MachineOrBoardQueryParameter_MachineInEhayWebApiModel,Entitys.Null_Or_EH_MachineInEhayModelModels> {

        /** define the constructor of MachineQueryController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "MachineQueryController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param machineName without remark
         */
        // tslint:disable-next-line:max-line-length
        GetMachineFilterTypes(machineName: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.Hongbo.Basic.Systems.LabelAndIntValue>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"machineName"}];
            actionInfo.inParameterDefines[0].value = machineName;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param companyName without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryCompanyAddress(companyName: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.Null_Or_String>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"companyName"}];
            actionInfo.inParameterDefines[0].value = companyName;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param companyNameKey without remark
         *   @param pageIndex without remark
         *   @param pageSize without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryMachineCompany(companyNameKey: Entitys.Null_Or_String,pageIndex: number,pageSize: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.GenericPageDataResponse<Entitys.EhayModel.Procedure.MachineCompanyModel>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"companyNameKey"},{"fromDefine":{},"name":"pageIndex"},{"fromDefine":{},"name":"pageSize"}];
            actionInfo.inParameterDefines[0].value = companyNameKey;
            actionInfo.inParameterDefines[1].value = pageIndex;
            actionInfo.inParameterDefines[2].value = pageSize;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param machineXid without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryMachineComplexInfo(machineXid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.System.Tuple_2<Entitys.EhayModel.Procedure.MachineComplexInfo,Array<Entitys.EhayModel.Procedure.FilterUsedTermInfo>>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"machineXid"}];
            actionInfo.inParameterDefines[0].value = machineXid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param queryMode without remark
         *   @param companyXid without remark
         *   @param pageIndex without remark
         *   @param pageSize without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryMachineComplexInfoList(queryMode: Entitys.EhayModel.Procedure.EnumQueryMachineComplexInfoMode,companyXid: Entitys.Null_Or_String,pageIndex: number,pageSize: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.GenericPageDataResponse<Entitys.EhayModel.Procedure.MachineComplexInfo>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"queryMode"},{"fromDefine":{},"name":"companyXid"},{"fromDefine":{},"name":"pageIndex"},{"fromDefine":{},"name":"pageSize"}];
            actionInfo.inParameterDefines[0].value = queryMode;
            actionInfo.inParameterDefines[1].value = companyXid;
            actionInfo.inParameterDefines[2].value = pageIndex;
            actionInfo.inParameterDefines[3].value = pageSize;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class MachineOperateController extends AbstractBaseController {

        /** define the constructor of MachineOperateController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "MachineOperateController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param request without remark
         */
        // tslint:disable-next-line:max-line-length
        SetMachineImage(request: Entitys.Null_Or_SetDeviceImageRequestInEhayWebApiModel): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"request"}];
            actionInfo.inParameterDefines[0].value = request;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class PlaySchemaQueryController extends AbstractBaseController {

        /** define the constructor of PlaySchemaQueryController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "PlaySchemaQueryController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param targetType without remark
         *   @param key without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryFilterTargetList(targetType: Entitys.EhayModel.Models.EnumPlayItemFilterTargetType,key: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.QuerySchemaFilterTargetResult>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"targetType"},{"fromDefine":{},"name":"key"}];
            actionInfo.inParameterDefines[0].value = targetType;
            actionInfo.inParameterDefines[1].value = key;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param cryptMachineIds without remark
         *   @param cryptDeviceApplyId without remark
         *   @param cryptOrderSuitId without remark
         *   @param pressWater without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryOnlyPlaySchema(cryptMachineIds: Array<Entitys.Null_Or_String>,cryptDeviceApplyId: Entitys.Null_Or_String,cryptOrderSuitId: Entitys.Null_Or_String,pressWater: Entitys.EhayLogModel.EnumPressWaterType): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.QueryOnlyPlaySchemaResponse>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cryptMachineIds"},{"fromDefine":{},"name":"cryptDeviceApplyId"},{"fromDefine":{},"name":"cryptOrderSuitId"},{"fromDefine":{},"name":"pressWater"}];
            actionInfo.inParameterDefines[0].value = cryptMachineIds;
            actionInfo.inParameterDefines[1].value = cryptDeviceApplyId;
            actionInfo.inParameterDefines[2].value = cryptOrderSuitId;
            actionInfo.inParameterDefines[3].value = pressWater;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class MobileChargeController extends AbstractWechatMpController {

        /** define the constructor of MobileChargeController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "MobileChargeController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param orderid without remark
         *   @param code without remark
         *   @param msg without remark
         *   @param timestamp without remark
         *   @param sign without remark
         */
        // tslint:disable-next-line:max-line-length
        MobileChargeNotify(orderid: Entitys.Null_Or_String,code: Entitys.Null_Or_String,msg: Entitys.Null_Or_String,timestamp: Entitys.Null_Or_String,sign: Entitys.Null_Or_String): Promise<any> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"orderid"},{"fromDefine":{},"name":"code"},{"fromDefine":{},"name":"msg"},{"fromDefine":{},"name":"timestamp"},{"fromDefine":{},"name":"sign"}];
            actionInfo.inParameterDefines[0].value = orderid;
            actionInfo.inParameterDefines[1].value = code;
            actionInfo.inParameterDefines[2].value = msg;
            actionInfo.inParameterDefines[3].value = timestamp;
            actionInfo.inParameterDefines[4].value = sign;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class WechatPayNotifyController extends AbstractAsyncBaseController {

        /** define the constructor of WechatPayNotifyController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "WechatPayNotifyController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param orderNumber without remark
         *   @param uniorderAttach without remark
         *   @param money without remark
         */
        // tslint:disable-next-line:max-line-length
        VerifyPaySuccessCallback(orderNumber: Entitys.Null_Or_String,uniorderAttach: Entitys.Null_Or_String,money: number): Promise<Entitys.Null_Or_String> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"orderNumber"},{"fromDefine":{},"name":"uniorderAttach"},{"fromDefine":{},"name":"money"}];
            actionInfo.inParameterDefines[0].value = orderNumber;
            actionInfo.inParameterDefines[1].value = uniorderAttach;
            actionInfo.inParameterDefines[2].value = money;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class WechatOrderController extends AbstractWechatMpController {

        /** define the constructor of WechatOrderController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "WechatOrderController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param openId without remark
         */
        // tslint:disable-next-line:max-line-length
        GetWcUserInfo(openId: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.Null_Or_String>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"openId"}];
            actionInfo.inParameterDefines[0].value = openId;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param sceneKey without remark
         *   @param items without remark
         *   @param advice without remark
         *   @param contactInfo without remark
         */
        // tslint:disable-next-line:max-line-length
        InputAdvice(sceneKey: Entitys.Null_Or_String,items: Array<Entitys.EhayWebApi.Model.WechatOrderItem>,advice: Entitys.Null_Or_String,contactInfo: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"sceneKey"},{"fromDefine":{},"name":"items"},{"fromDefine":{},"name":"advice"},{"fromDefine":{},"name":"contactInfo"}];
            actionInfo.inParameterDefines[0].value = sceneKey;
            actionInfo.inParameterDefines[1].value = items;
            actionInfo.inParameterDefines[2].value = advice;
            actionInfo.inParameterDefines[3].value = contactInfo;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param productGuid without remark
         *   @param wcUserGuid without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryProductInfo(productGuid: Entitys.Null_Or_String,wcUserGuid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.WechatOrderProductInfo>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"productGuid"},{"fromDefine":{},"name":"wcUserGuid"}];
            actionInfo.inParameterDefines[0].value = productGuid;
            actionInfo.inParameterDefines[1].value = wcUserGuid;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class KuaifaController extends AbstractBaseController {

        /** define the constructor of KuaifaController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "KuaifaController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param plan without remark
         */
        // tslint:disable-next-line:max-line-length
        AuditZhongmengMedia(plan: Entitys.Null_Or_EH_Zhongmeng_PlanInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"plan"}];
            actionInfo.inParameterDefines[0].value = plan;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xid without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryContentForAudit(xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.Zhongmeng_ContentForAudit>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = xid;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class YingfeiController extends AbstractAsyncRawDataController {

        /** define the constructor of YingfeiController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "YingfeiController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark */
        PayedNotify(): Promise<any> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class AdminAssistantController extends AbstractBaseController {

        /** define the constructor of AdminAssistantController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AdminAssistantController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        FillWcuserUnionId(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param contents without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        GetIdThenGetEntity(contents: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"contents"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = contents;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        ParceDeviceApplyAddress(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param urls without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        ProductMoqMpWechatUrl(urls: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"urls"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = urls;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xmachineId without remark
         */
        // tslint:disable-next-line:max-line-length
        ProductScanUrlForRelateMachineToAbstractUser(xmachineId: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xmachineId"}];
            actionInfo.inParameterDefines[0].value = xmachineId;
            return this.callAction(actionInfo);
        }
        /** without remark */
        ProductScanUrlForRelateToAbstractUser(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param urls without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        ProductWechatUrl(urls: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"urls"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = urls;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param keys without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryCache(keys: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"keys"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = keys;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param keys without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryDeviceApkParameter(keys: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"keys"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = keys;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xdeviceIds without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        RefreshDevicePlan(xdeviceIds: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xdeviceIds"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = xdeviceIds;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xdeviceIds without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        RefreshDevicePlanWithCalculate(xdeviceIds: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xdeviceIds"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = xdeviceIds;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        RefreshEntitySavedProcedure(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        RefreshUserFullPrivilege(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.Hongbo.Basic.Systems.CheckResult>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param urls without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        RegisterWechatWorkApp水机推广菜单(urls: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"urls"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = urls;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        ReloadConfig(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param contents without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        ReloadRedisObject(contents: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"contents"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = contents;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        SendWechatTemplateMessag_IntroductFriendSuccessMessage(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        SendWechatTemplateMessage_AdvplatformMediaPublishPlan_Audited(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        SendWechatTemplateMessage_AdvplatformMediaPublishPlan_AuditedFailure(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        SendWechatTemplateMessage_UnionUserNeedCharge(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        SendWechatTemplateMessage_WechatOrderPayedMessage(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param ids without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        TestDeserializeCache(ids: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"ids"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = ids;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        TestHongbao(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark */
        UnlateWechatToAbstractUser(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        ViewAssistantConfig(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param contents without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        Wechat_LittleAppSendServiceMessage(contents: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"contents"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = contents;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        Wechat_MpRegisterMenu(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        Wechat_MpRegisterMenu_ForPartner(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        Wechat_OldMpRegisterMenu(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param urls without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        WechatLong2Short(urls: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"urls"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = urls;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        WechatQueryMenu(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        数据处理_CalculateWechatProductScanWaterPriceJson(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param notuseInputParameter without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        添加Iot模板指令(notuseInputParameter: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"notuseInputParameter"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = notuseInputParameter;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param urls without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        添加分账联系人(urls: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"urls"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = urls;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class ApkRuntimeConfigController extends AbstractBaseController {

        /** define the constructor of ApkRuntimeConfigController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "ApkRuntimeConfigController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param json without remark
         */
        Set(json: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"json"}];
            actionInfo.inParameterDefines[0].value = json;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class ApkUploadController extends AbstractBaseController {

        /** define the constructor of ApkUploadController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "ApkUploadController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark */
        ApkRefresh(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param model without remark
         */
        // tslint:disable-next-line:max-line-length
        ApkUpdate(model: Entitys.Null_Or_ApkUpdateModelNewInEhayWebApiModel): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"model"}];
            actionInfo.inParameterDefines[0].value = model;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param apkType without remark
         *   @param versionToMillseconds without remark
         */
        // tslint:disable-next-line:max-line-length
        Create(apkType: Entitys.EhayModel.Models.EnumApkType,versionToMillseconds: boolean): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.ApkUpdateModelNew>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"apkType"},{"fromDefine":{},"name":"versionToMillseconds"}];
            actionInfo.inParameterDefines[0].value = apkType;
            actionInfo.inParameterDefines[1].value = versionToMillseconds;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param apkType without remark
         */
        // tslint:disable-next-line:max-line-length
        CurrentContent(apkType: Entitys.EhayModel.Models.EnumApkType): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.ApkJsonFileInfo>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"apkType"}];
            actionInfo.inParameterDefines[0].value = apkType;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class AnanymousAssistantController extends AbstractBaseController {

        /** define the constructor of AnanymousAssistantController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AnanymousAssistantController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark */
        // tslint:disable-next-line:max-line-length
        CityAndDistrict(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.hongbao.Vue.ElementUi.elmentui_option_stringvalue>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xunionuserid without remark
         */
        // tslint:disable-next-line:max-line-length
        EnumPrivileges(xunionuserid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.Hongbao.Privileges.PrivilegeCatalogDesc>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xunionuserid"}];
            actionInfo.inParameterDefines[0].value = xunionuserid;
            return this.callAction(actionInfo);
        }
        /** without remark */
        // tslint:disable-next-line:max-line-length
        GetAllEnums(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Controllers.Enum_LabenAndValueList>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark */
        // tslint:disable-next-line:max-line-length
        QueryUpdateLogList(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.EH_UpdateLog>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param code without remark
         */
        RandomImage(code: Entitys.Null_Or_String): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"code"}];
            actionInfo.inParameterDefines[0].value = code;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class BoxProductController extends AbstractAsyncBaseController {

        /** define the constructor of BoxProductController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "BoxProductController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:class-name
    export class CooperatePromoteController extends AbstractBaseController {

        /** define the constructor of CooperatePromoteController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "CooperatePromoteController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:class-name
    export class MachineUserOperateController extends AbstractBaseController {

        /** define the constructor of MachineUserOperateController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "MachineUserOperateController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param xid without remark
         */
        // tslint:disable-next-line:max-line-length
        GetEnableOperate(xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Controllers.DeviceApplyOperateCatalogMetaInfo>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"GetEnableOperate"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = xid;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class SceneController extends AbstractBaseController {

        /** define the constructor of SceneController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "SceneController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param cacheKey4ScanSceneInfoOrMarkSceneInfo without remark
         *   @param action without remark
         */
        // tslint:disable-next-line:max-line-length
        ProductSceneInfoForAction(cacheKey4ScanSceneInfoOrMarkSceneInfo: Entitys.Null_Or_String,action: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cacheKey4ScanSceneInfoOrMarkSceneInfo"},{"fromDefine":{},"name":"action"}];
            actionInfo.inParameterDefines[0].value = cacheKey4ScanSceneInfoOrMarkSceneInfo;
            actionInfo.inParameterDefines[1].value = action;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param cacheKey4ScanSceneInfoOrMarkSceneInfo without remark
         *   @param productType without remark
         */
        // tslint:disable-next-line:max-line-length
        ProductSceneInfoForProductBuy(cacheKey4ScanSceneInfoOrMarkSceneInfo: Entitys.Null_Or_String,productType: Entitys.EhayModel.Models.EnumWechatProductType): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cacheKey4ScanSceneInfoOrMarkSceneInfo"},{"fromDefine":{},"name":"productType"}];
            actionInfo.inParameterDefines[0].value = cacheKey4ScanSceneInfoOrMarkSceneInfo;
            actionInfo.inParameterDefines[1].value = productType;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param cacheKey4ScanSceneInfoOrMarkSceneInfo without remark
         */
        // tslint:disable-next-line:max-line-length
        ProductSceneInfoWithoutMask(cacheKey4ScanSceneInfoOrMarkSceneInfo: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cacheKey4ScanSceneInfoOrMarkSceneInfo"}];
            actionInfo.inParameterDefines[0].value = cacheKey4ScanSceneInfoOrMarkSceneInfo;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param sceneKey without remark
         *   @param url without remark
         */
        // tslint:disable-next-line:max-line-length
        productWeixinJssdkConfig(sceneKey: Entitys.Null_Or_String,url: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.Hongbo.Wechat.Jssdk.JSSdkConfigOption>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"sceneKey"},{"fromDefine":{},"name":"url"}];
            actionInfo.inParameterDefines[0].value = sceneKey;
            actionInfo.inParameterDefines[1].value = url;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param sceneKey without remark
         *   @param otherKeyForProduct without remark
         */
        // tslint:disable-next-line:max-line-length
        QuerySceneInfo(sceneKey: Entitys.Null_Or_String,otherKeyForProduct: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.AbstractSceneInfo>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"sceneKey"},{"fromDefine":{},"name":"otherKeyForProduct"}];
            actionInfo.inParameterDefines[0].value = sceneKey;
            actionInfo.inParameterDefines[1].value = otherKeyForProduct;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param cacheKey4SceneInfo without remark
         *   @param mediaXid without remark
         *   @param clientXid without remark
         *   @param thumbImageXid without remark
         *   @param targetUrl without remark
         *   @param targetThumbImageXid without remark
         */
        // tslint:disable-next-line:max-line-length
        RecordUserClick(cacheKey4SceneInfo: Entitys.Null_Or_String,mediaXid: Entitys.Null_Or_String,clientXid: Entitys.Null_Or_String,thumbImageXid: Entitys.Null_Or_String,targetUrl: Entitys.Null_Or_String,targetThumbImageXid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cacheKey4SceneInfo"},{"fromDefine":{},"name":"mediaXid"},{"fromDefine":{},"name":"clientXid"},{"fromDefine":{},"name":"thumbImageXid"},{"fromDefine":{},"name":"targetUrl"},{"fromDefine":{},"name":"targetThumbImageXid"}];
            actionInfo.inParameterDefines[0].value = cacheKey4SceneInfo;
            actionInfo.inParameterDefines[1].value = mediaXid;
            actionInfo.inParameterDefines[2].value = clientXid;
            actionInfo.inParameterDefines[3].value = thumbImageXid;
            actionInfo.inParameterDefines[4].value = targetUrl;
            actionInfo.inParameterDefines[5].value = targetThumbImageXid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param cacheKey4MarkOrScanSceneInfo without remark
         *   @param rand without remark
         */
        VerifyImage(cacheKey4MarkOrScanSceneInfo: Entitys.Null_Or_String,rand: Entitys.Null_Or_String): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"VerifyImage/{cacheKey4MarkOrScanSceneInfo}/{rand=0}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cacheKey4MarkOrScanSceneInfo"},{"fromDefine":{},"name":"rand"}];
            actionInfo.inParameterDefines[0].value = cacheKey4MarkOrScanSceneInfo;
            actionInfo.inParameterDefines[1].value = rand;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class SimpleEntityQueryController extends AbstractAsyncBaseController {

        /** define the constructor of SimpleEntityQueryController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "SimpleEntityQueryController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param entityTypeName without remark
         *   @param key without remark
         */
        // tslint:disable-next-line:max-line-length
        Index(entityTypeName: Entitys.Null_Or_String,key: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.SimpleEntityQueryResult>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"},{"fromDefine":{},"name":"key"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            actionInfo.inParameterDefines[1].value = key;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class PreOrderController extends AbstractBaseController {

        /** define the constructor of PreOrderController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "PreOrderController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param xid without remark
         */
        DeletePreOrder(xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = xid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xid without remark
         *   @param contents without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryBuildingList(xid: Entitys.Null_Or_GenericIdAndXidEntityInHongboEfsafeBasic<Entitys.EhayModel.Models.SL_PreOrder>,contents: Array<Entitys.Null_Or_String>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.BuildingCount>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"},{"fromDefine":{},"name":"contents"}];
            actionInfo.inParameterDefines[0].value = xid;
            actionInfo.inParameterDefines[1].value = contents;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xid without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryPreOrderDetail(xid: Entitys.Null_Or_GenericIdAndXidEntityInHongboEfsafeBasic<Entitys.EhayModel.Models.SL_PreOrder>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.SL_PreOrder>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = xid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param page without remark
         *   @param remark without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryPreorderList(page: Entitys.Null_Or_PageRequestInEhayModelModels,remark: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericPageDataResponseInEhayModelModels<any>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"page"},{"fromDefine":{},"name":"remark"}];
            actionInfo.inParameterDefines[0].value = page;
            actionInfo.inParameterDefines[1].value = remark;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param inputOrder without remark
         *   @param buildCountArray without remark
         */
        // tslint:disable-next-line:max-line-length
        Save(inputOrder: Entitys.Null_Or_SL_PreOrderInEhayModelModels,buildCountArray: Array<Entitys.EhayModel.Models.BuildingCount>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.SL_PreOrder>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"inputOrder"},{"fromDefine":{},"name":"buildCountArray"}];
            actionInfo.inParameterDefines[0].value = inputOrder;
            actionInfo.inParameterDefines[1].value = buildCountArray;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class SalesOrderController extends AbstractBaseController {

        /** define the constructor of SalesOrderController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "SalesOrderController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param xid without remark
         *   @param operateDesc without remark
         *   @param newState without remark
         */
        // tslint:disable-next-line:max-line-length
        Action(xid: Entitys.Null_Or_GenericIdAndXidEntityInHongboEfsafeBasic<Entitys.EhayModel.Models.SL_Order>,operateDesc: Entitys.Null_Or_String,newState: Entitys.EhayModel.Models.EnumOrderState): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"},{"fromDefine":{},"name":"operateDesc"},{"fromDefine":{},"name":"newState"}];
            actionInfo.inParameterDefines[0].value = xid;
            actionInfo.inParameterDefines[1].value = operateDesc;
            actionInfo.inParameterDefines[2].value = newState;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param client without remark
         *   @param money without remark
         *   @param chargeType without remark
         *   @param moneyDate without remark
         */
        // tslint:disable-next-line:max-line-length
        Charge(client: Entitys.Null_Or_GenericIdAndXidEntityInHongboEfsafeBasic<Entitys.EhayModel.Models.EH_Client>,money: number,chargeType: Entitys.EhayModel.Models.EnumClientChargeType,moneyDate: Date): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.ChargeResult>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"client"},{"fromDefine":{},"name":"money"},{"fromDefine":{},"name":"chargeType"},{"fromDefine":{},"name":"moneyDate"}];
            actionInfo.inParameterDefines[0].value = client;
            actionInfo.inParameterDefines[1].value = money;
            actionInfo.inParameterDefines[2].value = chargeType;
            actionInfo.inParameterDefines[3].value = moneyDate;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param key without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryClientAgentList(key: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.EH_ClientAgent>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"key"}];
            actionInfo.inParameterDefines[0].value = key;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xid without remark
         *   @param key without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryClientContactInfo(xid: Entitys.Null_Or_GenericIdAndXidEntityInHongboEfsafeBasic<Entitys.EhayModel.Models.EH_Client>,key: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.EH_ClientContactInfo>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"},{"fromDefine":{},"name":"key"}];
            actionInfo.inParameterDefines[0].value = xid;
            actionInfo.inParameterDefines[1].value = key;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param key without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryClientList(key: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.EH_Client>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"key"}];
            actionInfo.inParameterDefines[0].value = key;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryOrder(id: Entitys.Null_Or_GenericIdAndXidEntityInHongboEfsafeBasic<Entitys.EhayModel.Models.SL_Order>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.OrderAndSuitList>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param orderSuitId without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryResource(orderSuitId: Entitys.Null_Or_GenericIdAndXidEntityInHongboEfsafeBasic<Entitys.EhayModel.Models.SL_OrderSuit>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.CityCount>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"orderSuitId"}];
            actionInfo.inParameterDefines[0].value = orderSuitId;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param key without remark
         *   @param priceType without remark
         */
        // tslint:disable-next-line:max-line-length
        QuerySuitList(key: Entitys.Null_Or_String,priceType: Entitys.EhayModel.Models.EnumPriceCalculateType): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.SL_Suit>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"key"},{"fromDefine":{},"name":"priceType"}];
            actionInfo.inParameterDefines[0].value = key;
            actionInfo.inParameterDefines[1].value = priceType;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param order without remark
         *   @param suitList without remark
         *   @param operateDesc without remark
         */
        // tslint:disable-next-line:max-line-length
        Save(order: Entitys.Null_Or_SL_OrderInEhayModelModels,suitList: Array<Entitys.EhayModel.Models.SL_OrderSuit>,operateDesc: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.SL_Order>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"order"},{"fromDefine":{},"name":"suitList"},{"fromDefine":{},"name":"operateDesc"}];
            actionInfo.inParameterDefines[0].value = order;
            actionInfo.inParameterDefines[1].value = suitList;
            actionInfo.inParameterDefines[2].value = operateDesc;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param order without remark
         */
        // tslint:disable-next-line:max-line-length
        WorkFlowList(order: Entitys.Null_Or_SL_OrderInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.Null_Or_GenericWorkFlowInEhayWebApiModel<Entitys.EhayModel.Models.SL_Order,Entitys.EhayModel.Models.EnumOrderState>>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"order"}];
            actionInfo.inParameterDefines[0].value = order;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class PlayStatisticsController extends AbstractBaseController {

        /** define the constructor of PlayStatisticsController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "PlayStatisticsController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param statPar without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryPlayDetail(statPar: Entitys.Null_Or_MediaPlayStatisticsParInEhayWebApiControllers): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Controllers.PlayDetailByMedia>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"statPar"}];
            actionInfo.inParameterDefines[0].value = statPar;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param statPar without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryPlayStatistics(statPar: Entitys.Null_Or_MediaPlayStatisticsParInEhayWebApiControllers): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.MediaPlayStatisticsResult>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"statPar"}];
            actionInfo.inParameterDefines[0].value = statPar;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param statPar without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryRestPlayStatistics(statPar: Entitys.Null_Or_MediaPlayStatisticsParInEhayWebApiControllers): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.MediaPlayStatisticsResult>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"statPar"}];
            actionInfo.inParameterDefines[0].value = statPar;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class BonusController extends AbstractBaseController {

        /** define the constructor of BonusController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "BonusController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param sceneGuid without remark
         *   @param openId without remark
         *   @param name without remark
         *   @param address without remark
         *   @param mobile without remark
         */
        // tslint:disable-next-line:max-line-length
        BonusRegister(sceneGuid: Entitys.Null_Or_String,openId: Entitys.Null_Or_String,name: Entitys.Null_Or_String,address: Entitys.Null_Or_String,mobile: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"sceneGuid"},{"fromDefine":{},"name":"openId"},{"fromDefine":{},"name":"name"},{"fromDefine":{},"name":"address"},{"fromDefine":{},"name":"mobile"}];
            actionInfo.inParameterDefines[0].value = sceneGuid;
            actionInfo.inParameterDefines[1].value = openId;
            actionInfo.inParameterDefines[2].value = name;
            actionInfo.inParameterDefines[3].value = address;
            actionInfo.inParameterDefines[4].value = mobile;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param bonus without remark
         */
        // tslint:disable-next-line:max-line-length
        CreateOrEdit(bonus: Entitys.Null_Or_EH_BonusDefineInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.EH_BonusDefine>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"bonus"}];
            actionInfo.inParameterDefines[0].value = bonus;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param sceneGuid without remark
         *   @param openId without remark
         */
        // tslint:disable-next-line:max-line-length
        GetBonusAccordSceneId(sceneGuid: Entitys.Null_Or_String,openId: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.EH_BonusDefine>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"sceneGuid"},{"fromDefine":{},"name":"openId"}];
            actionInfo.inParameterDefines[0].value = sceneGuid;
            actionInfo.inParameterDefines[1].value = openId;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param nameKey without remark
         *   @param state without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryList(nameKey: Entitys.Null_Or_String,state: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.EH_BonusDefine>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"nameKey"},{"fromDefine":{},"name":"state"}];
            actionInfo.inParameterDefines[0].value = nameKey;
            actionInfo.inParameterDefines[1].value = state;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class DebugController extends AbstractBaseController {

        /** define the constructor of DebugController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "DebugController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param int1 without remark
         *   @param int2 without remark
         */
        AddMulti(int1: number,int2: number): Promise<Entitys.System.Tuple_2<number,number>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"int1"},{"fromDefine":{},"name":"int2"}];
            actionInfo.inParameterDefines[0].value = int1;
            actionInfo.inParameterDefines[1].value = int2;
            return this.callAction(actionInfo);
        }
        /** without remark */
        AppDomainPath(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark */
        AuthenUrl(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark */
        DelayTask(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param scene without remark
         */
        GetWhMediaQrcode(scene: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"GetWhMediaQrcode/{scene}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"scene"}];
            actionInfo.inParameterDefines[0].value = scene;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        Info(id: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark */
        NullMethod(): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        OpenId(id: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark */
        ProductOtherTypeScript(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.UsedForOutput>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark */
        test(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param message without remark
         */
        TestAsyncMessageHandle(message: Entitys.Null_Or_String): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"message"}];
            actionInfo.inParameterDefines[0].value = message;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        TestDecrypt(id: number): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark */
        TestMehod(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param iccid without remark
         */
        TestRefreshSim(iccid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"iccid"}];
            actionInfo.inParameterDefines[0].value = iccid;
            return this.callAction(actionInfo);
        }
        /** without remark */
        TestScript(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"TestScript"};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark */
        TestTuple(): Promise<any> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        Uncompress7Z(id: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class MachineUserQueryController extends AbstractWechatMpController {

        /** define the constructor of MachineUserQueryController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "MachineUserQueryController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark */
        Export(): Promise<any> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param parameter without remark
         */
        // tslint:disable-next-line:max-line-length
        Index(parameter: Entitys.Null_Or_DeviceApplyQueryParameterInEhayWebApiModel): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.GenericPageDataResponse<Entitys.EhayWebApi.Model.DeviceApplyCompanyInfo>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"parameter"}];
            actionInfo.inParameterDefines[0].value = parameter;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param openId without remark
         *   @param state without remark
         */
        // tslint:disable-next-line:max-line-length
        IntroduceList(openId: Entitys.Null_Or_String,state: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.DeviceApplyCompanyInfo>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"openId"},{"fromDefine":{},"name":"state"}];
            actionInfo.inParameterDefines[0].value = openId;
            actionInfo.inParameterDefines[1].value = state;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param shortUrl without remark
         *   @param fullUrl without remark
         */
        // tslint:disable-next-line:max-line-length
        productMpWeixinJssdkConfig(shortUrl: Entitys.Null_Or_String,fullUrl: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.Hongbo.Wechat.Jssdk.JSSdkConfigOption>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"shortUrl"},{"fromDefine":{},"name":"fullUrl"}];
            actionInfo.inParameterDefines[0].value = shortUrl;
            actionInfo.inParameterDefines[1].value = fullUrl;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param shortUrl without remark
         *   @param fullUrl without remark
         */
        // tslint:disable-next-line:max-line-length
        productWeixinJssdkConfig(shortUrl: Entitys.Null_Or_String,fullUrl: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.Hongbo.Wechat.Jssdk.JSSdkConfigOption>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"shortUrl"},{"fromDefine":{},"name":"fullUrl"}];
            actionInfo.inParameterDefines[0].value = shortUrl;
            actionInfo.inParameterDefines[1].value = fullUrl;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param req without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryBuildlist(req: Entitys.Null_Or_InputObjectInEhayWebApiControllers<Entitys.EhayModel.Models.View_Buildinfo>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.GenericPageDataResponse<any>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"req"}];
            actionInfo.inParameterDefines[0].value = req;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param parameter without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryDeviceApply(parameter: Entitys.Null_Or_GenericIdAndXidEntityInHongboEfsafeBasic<Entitys.EhayModel.Models.EH_DeviceApply>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.GenericPageDataResponse<Entitys.EhayWebApi.Model.DeviceApplyCompanyInfo>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"parameter"}];
            actionInfo.inParameterDefines[0].value = parameter;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param parameter without remark
         *   @param cryptDeviceId without remark
         */
        // tslint:disable-next-line:max-line-length
        queryDeviceApplyAllImage(parameter: Entitys.Null_Or_GenericIdAndXidEntityInHongboEfsafeBasic<Entitys.EhayModel.Models.EH_DeviceApply>,cryptDeviceId: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.DeviceOperateImage>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"parameter"},{"fromDefine":{},"name":"cryptDeviceId"}];
            actionInfo.inParameterDefines[0].value = parameter;
            actionInfo.inParameterDefines[1].value = cryptDeviceId;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param parameter without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryDeviceApplyImage(parameter: Entitys.Null_Or_GenericIdAndXidEntityInHongboEfsafeBasic<Entitys.EhayModel.Models.EH_DeviceApply>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Array<Entitys.EhayWebApi.Model.DeviceOperateImage>>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"parameter"}];
            actionInfo.inParameterDefines[0].value = parameter;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xid without remark
         */
        // tslint:disable-next-line:max-line-length
        QuerySetupMachineIds(xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.Null_Or_String>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = xid;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class EhayQrcodeController extends AbstractWechatMpController {

        /** define the constructor of EhayQrcodeController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "EhayQrcodeController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param guidType without remark
         *   @param cnt without remark
         *   @param otherXid without remark
         */
        // tslint:disable-next-line:max-line-length
        GetRegisterUrlList(guidType: Entitys.EhayModel.EnumEhayQrcodeType,cnt: number,otherXid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.QrcodeInfo>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guidType"},{"fromDefine":{},"name":"cnt"},{"fromDefine":{},"name":"otherXid"}];
            actionInfo.inParameterDefines[0].value = guidType;
            actionInfo.inParameterDefines[1].value = cnt;
            actionInfo.inParameterDefines[2].value = otherXid;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class TestxController extends AbstractBaseController {

        /** define the constructor of TestxController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "TestxController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:class-name
    export class YouzanController extends AbstractAsyncRawDataController {

        /** define the constructor of YouzanController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "YouzanController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param context without remark
         *   @param trade without remark
         */
        // tslint:disable-next-line:max-line-length
        ConvertToWechatOrder(context: Entitys.Null_Or_EhayContextInEhayModelModels,trade: Entitys.Null_Or_PushMessage_TradeOrderStateInyouzancomyouzanpush): Promise<Entitys.Null_Or_EH_WechatOrderInEhayModelModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"context"},{"fromDefine":{},"name":"trade"}];
            actionInfo.inParameterDefines[0].value = context;
            actionInfo.inParameterDefines[1].value = trade;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param status without remark
         *   @param item without remark
         */
        // tslint:disable-next-line:max-line-length
        Handle_ItemInfo(status: Entitys.Null_Or_String,item: Entitys.Null_Or_PushMessage_ItemInfoInyouzancomyouzanpush): Promise<Entitys.System.Void> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"status"},{"fromDefine":{},"name":"item"}];
            actionInfo.inParameterDefines[0].value = status;
            actionInfo.inParameterDefines[1].value = item;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param status without remark
         *   @param trade without remark
         */
        // tslint:disable-next-line:max-line-length
        Handle_TradeOrderState(status: Entitys.Null_Or_String,trade: Entitys.Null_Or_PushMessage_TradeOrderStateInyouzancomyouzanpush): Promise<Entitys.System.Void> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"status"},{"fromDefine":{},"name":"trade"}];
            actionInfo.inParameterDefines[0].value = status;
            actionInfo.inParameterDefines[1].value = trade;
            return this.callAction(actionInfo);
        }
        /** without remark */
        RegisterMachine(): Promise<Entitys.Null_Or_ActionResultInSystemWebMvc> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param context without remark
         *   @param order without remark
         */
        // tslint:disable-next-line:max-line-length
        TRADE_BUYER_SIGNED(context: Entitys.Null_Or_EhayContextInEhayModelModels,order: Entitys.Null_Or_EH_WechatOrderInEhayModelModels): Promise<Entitys.System.Void> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"context"},{"fromDefine":{},"name":"order"}];
            actionInfo.inParameterDefines[0].value = context;
            actionInfo.inParameterDefines[1].value = order;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param context without remark
         *   @param order without remark
         */
        // tslint:disable-next-line:max-line-length
        TRADE_CLOSE(context: Entitys.Null_Or_EhayContextInEhayModelModels,order: Entitys.Null_Or_EH_WechatOrderInEhayModelModels): Promise<Entitys.System.Void> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"context"},{"fromDefine":{},"name":"order"}];
            actionInfo.inParameterDefines[0].value = context;
            actionInfo.inParameterDefines[1].value = order;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param context without remark
         *   @param order without remark
         */
        // tslint:disable-next-line:max-line-length
        TRADE_SUCCESS(context: Entitys.Null_Or_EhayContextInEhayModelModels,order: Entitys.Null_Or_EH_WechatOrderInEhayModelModels): Promise<Entitys.System.Void> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"context"},{"fromDefine":{},"name":"order"}];
            actionInfo.inParameterDefines[0].value = context;
            actionInfo.inParameterDefines[1].value = order;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param context without remark
         *   @param order without remark
         */
        // tslint:disable-next-line:max-line-length
        WAIT_BUYER_PAY(context: Entitys.Null_Or_EhayContextInEhayModelModels,order: Entitys.Null_Or_EH_WechatOrderInEhayModelModels): Promise<Entitys.System.Void> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"context"},{"fromDefine":{},"name":"order"}];
            actionInfo.inParameterDefines[0].value = context;
            actionInfo.inParameterDefines[1].value = order;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param context without remark
         *   @param order without remark
         */
        // tslint:disable-next-line:max-line-length
        WAIT_SELLER_SEND_GOODS(context: Entitys.Null_Or_EhayContextInEhayModelModels,order: Entitys.Null_Or_EH_WechatOrderInEhayModelModels): Promise<Entitys.System.Void> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"context"},{"fromDefine":{},"name":"order"}];
            actionInfo.inParameterDefines[0].value = context;
            actionInfo.inParameterDefines[1].value = order;
            return this.callAction(actionInfo);
        }
        /** without remark */
        Welcome(): Promise<any> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class ZhongmengController extends AbstractBaseController {

        /** define the constructor of ZhongmengController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "ZhongmengController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param plan without remark
         */
        // tslint:disable-next-line:max-line-length
        AuditZhongmengMedia(plan: Entitys.Null_Or_EH_Zhongmeng_PlanInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"plan"}];
            actionInfo.inParameterDefines[0].value = plan;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xid without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryContentForAudit(xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.Zhongmeng_ContentForAudit>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = xid;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class WcPartnerController extends AbstractBaseController {

        /** define the constructor of WcPartnerController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "WcPartnerController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param cacheKey4SceneInfo without remark
         *   @param verify without remark
         */
        // tslint:disable-next-line:max-line-length
        GetBonus(cacheKey4SceneInfo: Entitys.Null_Or_String,verify: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.WcPartnerBonusResult>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cacheKey4SceneInfo"},{"fromDefine":{},"name":"verify"}];
            actionInfo.inParameterDefines[0].value = cacheKey4SceneInfo;
            actionInfo.inParameterDefines[1].value = verify;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param cryptPartnerId without remark
         */
        // tslint:disable-next-line:max-line-length
        IntroduceDeviceStatistics(cryptPartnerId: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.WcPartnerDeviceBonusStatistics>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cryptPartnerId"}];
            actionInfo.inParameterDefines[0].value = cryptPartnerId;
            return this.callAction(actionInfo);
        }
        /** without remark */
        // tslint:disable-next-line:max-line-length
        IntroduceStatistics(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.WcPartnerBonusStatistics>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param subOrNot without remark
         *   @param scene without remark
         */
        NotifySubscribe(subOrNot: number,scene: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"Notify/{scene}/{subOrNot}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"subOrNot"},{"fromDefine":{},"name":"scene"}];
            actionInfo.inParameterDefines[0].value = subOrNot;
            actionInfo.inParameterDefines[1].value = scene;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param cacheKey4SceneInfo without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryFirstNotMarkWcPartner(cacheKey4SceneInfo: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.Info4MarkWcPartner>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cacheKey4SceneInfo"}];
            actionInfo.inParameterDefines[0].value = cacheKey4SceneInfo;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param cacheKey4SceneInfo without remark
         *   @param first without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryNotMarkWcPartner(cacheKey4SceneInfo: Entitys.Null_Or_String,first: boolean): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.Info4MarkWcPartner>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"cacheKey4SceneInfo"},{"fromDefine":{},"name":"first"}];
            actionInfo.inParameterDefines[0].value = cacheKey4SceneInfo;
            actionInfo.inParameterDefines[1].value = first;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class WechatBuyController extends AbstractWechatMpController {

        /** define the constructor of WechatBuyController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "WechatBuyController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param productguid without remark
         *   @param productcount without remark
         *   @param openid without remark
         *   @param facecode without remark
         */
        // tslint:disable-next-line:max-line-length
        Facepay(productguid: Entitys.Null_Or_String,productcount: Entitys.Null_Or_String,openid: Entitys.Null_Or_String,facecode: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"productguid"},{"fromDefine":{},"name":"productcount"},{"fromDefine":{},"name":"openid"},{"fromDefine":{},"name":"facecode"}];
            actionInfo.inParameterDefines[0].value = productguid;
            actionInfo.inParameterDefines[1].value = productcount;
            actionInfo.inParameterDefines[2].value = openid;
            actionInfo.inParameterDefines[3].value = facecode;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param sceneKey without remark
         *   @param orderInputInfo without remark
         *   @param items without remark
         */
        // tslint:disable-next-line:max-line-length
        PayInfo(sceneKey: Entitys.Null_Or_String,orderInputInfo: Entitys.Null_Or_WechatOrderInputInfoInEhayWebApiModel,items: Array<Entitys.EhayWebApi.Model.WechatOrderItem>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.EhayPayInfoForWeixinJsBridge>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"sceneKey"},{"fromDefine":{},"name":"orderInputInfo"},{"fromDefine":{},"name":"items"}];
            actionInfo.inParameterDefines[0].value = sceneKey;
            actionInfo.inParameterDefines[1].value = orderInputInfo;
            actionInfo.inParameterDefines[2].value = items;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param orderNumber without remark
         *   @param uniorderAttach without remark
         *   @param money without remark
         */
        // tslint:disable-next-line:max-line-length
        VerifyPaySuccessCallback(orderNumber: Entitys.Null_Or_String,uniorderAttach: Entitys.Null_Or_String,money: number): Promise<Entitys.Null_Or_String> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"orderNumber"},{"fromDefine":{},"name":"uniorderAttach"},{"fromDefine":{},"name":"money"}];
            actionInfo.inParameterDefines[0].value = orderNumber;
            actionInfo.inParameterDefines[1].value = uniorderAttach;
            actionInfo.inParameterDefines[2].value = money;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class EntityController extends AbstractBaseController {

        /** define the constructor of EntityController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "EntityController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param entityTypeName without remark
         *   @param xid without remark
         */
        // tslint:disable-next-line:max-line-length
        DeleteEntity(entityTypeName: Entitys.EhayModel.Models.EnumEntityType,xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"},{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            actionInfo.inParameterDefines[1].value = xid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param entityType without remark
         *   @param name without remark
         */
        // tslint:disable-next-line:max-line-length
        ExistsEntity(entityType: Entitys.Null_Or_String,name: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<boolean>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityType"},{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = entityType;
            actionInfo.inParameterDefines[1].value = name;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param entityTypeName without remark
         */
        // tslint:disable-next-line:max-line-length
        GetElTableColumnList(entityTypeName: Entitys.EhayModel.Models.EnumEntityType): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.hongbao.Vue.ElementUi.ELTableAttribute>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param entityTypeName without remark
         *   @param pageSize without remark
         *   @param pageIndex without remark
         *   @param inputObject without remark
         */
        // tslint:disable-next-line:max-line-length
        GetEntityList(entityTypeName: Entitys.EhayModel.Models.EnumEntityType,pageSize: number,pageIndex: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.GenericPageDataResponse<any>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"entityTypeName"},{"fromDefine":{},"name":"pageSize"},{"fromDefine":{},"name":"pageIndex"}];
            actionInfo.inParameterDefines[0].value = entityTypeName;
            actionInfo.inParameterDefines[1].value = pageSize;
            actionInfo.inParameterDefines[2].value = pageIndex;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class SimController extends AbstractAsyncBaseController {

        /** define the constructor of SimController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "SimController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param iccids without remark
         */
        Active(iccids: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"iccids"}];
            actionInfo.inParameterDefines[0].value = iccids;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param iccids without remark
         */
        Deactive(iccids: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"iccids"}];
            actionInfo.inParameterDefines[0].value = iccids;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param iccid without remark
         */
        // tslint:disable-next-line:max-line-length
        Query(iccid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.EH_SimInfo>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"iccid"}];
            actionInfo.inParameterDefines[0].value = iccid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param iccids without remark
         */
        ReActive(iccids: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"iccids"}];
            actionInfo.inParameterDefines[0].value = iccids;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param deviceCryptId without remark
         *   @param iccid without remark
         */
        // tslint:disable-next-line:max-line-length
        ReActiveWithDevice(deviceCryptId: Entitys.Null_Or_String,iccid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"deviceCryptId"},{"fromDefine":{},"name":"iccid"}];
            actionInfo.inParameterDefines[0].value = deviceCryptId;
            actionInfo.inParameterDefines[1].value = iccid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param iccid without remark
         */
        // tslint:disable-next-line:max-line-length
        RefreshCardInfo(iccid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.EH_SimInfo>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"iccid"}];
            actionInfo.inParameterDefines[0].value = iccid;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class WaterAdminController extends AbstractBaseController {

        /** define the constructor of WaterAdminController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "WaterAdminController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param id without remark
         */
        DeleteSuit(id: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param parameter without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryWaterStore(parameter: Entitys.Null_Or_WaterStoreQueryRequestInEhayWebApiModel): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.GenericPageDataResponse<Entitys.EhayModel.Models.WS_WaterStore>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"parameter"}];
            actionInfo.inParameterDefines[0].value = parameter;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        RestoreWaterStore(id: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param suit without remark
         */
        // tslint:disable-next-line:max-line-length
        SaveSuit(suit: Entitys.Null_Or_WS_WaterSuitInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.WS_WaterSuit>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"suit"}];
            actionInfo.inParameterDefines[0].value = suit;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param store without remark
         *   @param province without remark
         *   @param city without remark
         *   @param district without remark
         */
        // tslint:disable-next-line:max-line-length
        SaveWaterStore(store: Entitys.Null_Or_WS_WaterStoreInEhayModelModels,province: Entitys.Null_Or_String,city: Entitys.Null_Or_String,district: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayModel.Models.WS_WaterStore>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"store"},{"fromDefine":{},"name":"province"},{"fromDefine":{},"name":"city"},{"fromDefine":{},"name":"district"}];
            actionInfo.inParameterDefines[0].value = store;
            actionInfo.inParameterDefines[1].value = province;
            actionInfo.inParameterDefines[2].value = city;
            actionInfo.inParameterDefines[3].value = district;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param waterStoreId without remark
         *   @param brands without remark
         */
        // tslint:disable-next-line:max-line-length
        SaveWaterStoreAgentBrand(waterStoreId: number,brands: Array<Entitys.EhayModel.Models.WS_WaterBrand>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.WS_WaterStoreAgentBrand>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"waterStoreId"},{"fromDefine":{},"name":"brands"}];
            actionInfo.inParameterDefines[0].value = waterStoreId;
            actionInfo.inParameterDefines[1].value = brands;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        StopWaterStore(id: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class PlaySchemaController extends AbstractBaseController {

        /** define the constructor of PlaySchemaController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "PlaySchemaController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param model without remark
         */
        // tslint:disable-next-line:max-line-length
        SetNotify(model: Entitys.Null_Or_TextNotifySetModelInEhayWebApiModel): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"model"}];
            actionInfo.inParameterDefines[0].value = model;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param removeItems without remark
         *   @param notmodifyItems without remark
         *   @param plan without remark
         */
        // tslint:disable-next-line:max-line-length
        SetPlaySchema(removeItems: Array<Entitys.Null_Or_String>,notmodifyItems: Array<Entitys.Null_Or_String>,plan: Entitys.Null_Or_PlaySchemaInEhayWebApiModel): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"removeItems"},{"fromDefine":{},"name":"notmodifyItems"},{"fromDefine":{},"name":"plan"}];
            actionInfo.inParameterDefines[0].value = removeItems;
            actionInfo.inParameterDefines[1].value = notmodifyItems;
            actionInfo.inParameterDefines[2].value = plan;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class UserInfoController extends AbstractBaseController {

        /** define the constructor of UserInfoController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "UserInfoController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark */
        DownWalletDetail(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.UserWalletStat>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param xreq without remark
         */
        // tslint:disable-next-line:max-line-length
        Info(xreq: Entitys.Null_Or_UserInfoRequestInEhayWebApiModel): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.UserInfoResponse>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"xreq"}];
            actionInfo.inParameterDefines[0].value = xreq;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param userType without remark
         *   @param xid without remark
         *   @param privileges without remark
         */
        // tslint:disable-next-line:max-line-length
        SavePrivilege(userType: Entitys.EhayModel.EnumLoginUserType,xid: Entitys.Null_Or_String,privileges: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"userType"},{"fromDefine":{},"name":"xid"},{"fromDefine":{},"name":"privileges"}];
            actionInfo.inParameterDefines[0].value = userType;
            actionInfo.inParameterDefines[1].value = xid;
            actionInfo.inParameterDefines[2].value = privileges;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param money without remark
         */
        Transmit(money: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"money"}];
            actionInfo.inParameterDefines[0].value = money;
            return this.callAction(actionInfo);
        }
        /** without remark */
        WalletDetail(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.UserWalletStat>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class MachineOrDeviceOperateController extends AbstractBaseController {

        /** define the constructor of MachineOrDeviceOperateController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "MachineOrDeviceOperateController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param content without remark
         *   @param appid without remark
         *   @param sign without remark
         */
        LockByCooperate(content: Entitys.Null_Or_String,appid: Entitys.Null_Or_String,sign: Entitys.Null_Or_String): Promise<any> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"content"},{"fromDefine":{},"name":"appid"},{"fromDefine":{},"name":"sign"}];
            actionInfo.inParameterDefines[0].value = content;
            actionInfo.inParameterDefines[1].value = appid;
            actionInfo.inParameterDefines[2].value = sign;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param idArray without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        LockMachine(idArray: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"idArray"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = idArray;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param isQueryMachine without remark
         *   @param xid without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryConfigContent(isQueryMachine: boolean,xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"isQueryMachine"},{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = isQueryMachine;
            actionInfo.inParameterDefines[1].value = xid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param isQueryMachine without remark
         *   @param xid without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryOperateInfo(isQueryMachine: boolean,xid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Model.MachineOrBoardOperateQueryResponse>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"isQueryMachine"},{"fromDefine":{},"name":"xid"}];
            actionInfo.inParameterDefines[0].value = isQueryMachine;
            actionInfo.inParameterDefines[1].value = xid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param isQueryMachine without remark
         *   @param ids without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryOperatesInfo(isQueryMachine: boolean,ids: Array<Entitys.Null_Or_String>): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.MachineOrBoardOperateQueryResponse>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"isQueryMachine"},{"fromDefine":{},"name":"ids"}];
            actionInfo.inParameterDefines[0].value = isQueryMachine;
            actionInfo.inParameterDefines[1].value = ids;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param request without remark
         */
        // tslint:disable-next-line:max-line-length
        SetDeviceImage(request: Entitys.Null_Or_SetDeviceImageRequestInEhayWebApiModel): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"request"}];
            actionInfo.inParameterDefines[0].value = request;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param idArray without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        SetDeviceLost(idArray: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"idArray"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = idArray;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param idArray without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        SetDeviceNeedRestart(idArray: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"idArray"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = idArray;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param idArray without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        SetDeviceNeedUploadConfig(idArray: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"idArray"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = idArray;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param idArray without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        UnlockMachine(idArray: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"idArray"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = idArray;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class UploadController extends AbstractBaseController {

        /** define the constructor of UploadController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "UploadController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark */
        UploadFiles(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.UploadFileResult>>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class MediaAdminController extends AbstractBaseController {

        /** define the constructor of MediaAdminController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "MediaAdminController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param idArray without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        Audit(idArray: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"idArray"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = idArray;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param howToQueryImage without remark
         *   @param json without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryImageList(howToQueryImage: Entitys.EhayWebApi.Interfaces.EnumHowToQueryImage,json: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayModel.Models.MediaThumbImageOrTargetImage>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"howToQueryImage"},{"fromDefine":{},"name":"json"}];
            actionInfo.inParameterDefines[0].value = howToQueryImage;
            actionInfo.inParameterDefines[1].value = json;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class DeviceQueryController extends AbstractMachineOrDeviceQueryController<Entitys.Null_Or_MachineOrBoardQueryParameter_DeviceInEhayWebApiModel,Entitys.Null_Or_EH_DeviceInfoInEhayModelModels> {

        /** define the constructor of DeviceQueryController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "DeviceQueryController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param guid without remark
         *   @param qrcodeType without remark
         */
        // tslint:disable-next-line:max-line-length
        QueryName(guid: Entitys.Null_Or_String,qrcodeType: number): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"guid"},{"fromDefine":{},"name":"qrcodeType"}];
            actionInfo.inParameterDefines[0].value = guid;
            actionInfo.inParameterDefines[1].value = qrcodeType;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class EhayLoginController extends AbstractBaseController {

        /** define the constructor of EhayLoginController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "EhayLoginController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param email without remark
         *   @param password without remark
         *   @param wcuserXid without remark
         */
        // tslint:disable-next-line:max-line-length
        LoginByEmail(email: Entitys.Null_Or_String,password: Entitys.Null_Or_String,wcuserXid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"email"},{"fromDefine":{},"name":"password"},{"fromDefine":{},"name":"wcuserXid"}];
            actionInfo.inParameterDefines[0].value = email;
            actionInfo.inParameterDefines[1].value = password;
            actionInfo.inParameterDefines[2].value = wcuserXid;
            return this.callAction(actionInfo);
        }
        /** without remark */
        LogOut(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param email without remark
         *   @param verify without remark
         *   @param password without remark
         */
        // tslint:disable-next-line:max-line-length
        Reset(email: Entitys.Null_Or_String,verify: Entitys.Null_Or_String,password: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"email"},{"fromDefine":{},"name":"verify"},{"fromDefine":{},"name":"password"}];
            actionInfo.inParameterDefines[0].value = email;
            actionInfo.inParameterDefines[1].value = verify;
            actionInfo.inParameterDefines[2].value = password;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param email without remark
         */
        SendPwdVerify(email: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"email"}];
            actionInfo.inParameterDefines[0].value = email;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class OperateStatisticsController extends AbstractBaseController {

        /** define the constructor of OperateStatisticsController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "OperateStatisticsController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark */
        // tslint:disable-next-line:max-line-length
        MonthStatForSetupAndPlay(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Entitys.EhayWebApi.Controllers.SetupDeviceAndPlayStat>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class ValuesController extends AbstractBaseController {

        /** define the constructor of ValuesController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "ValuesController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param id without remark
         */
        // tslint:disable-next-line:max-line-length
        Index(id: Entitys.Null_Or_String): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Array<Entitys.EhayWebApi.Model.StringIdAndNameAndChild>>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
    }
    /** define a static instance of AbstractQuestionController */
    // tslint:disable-next-line:max-line-length
    export const AbstractQuestionInstance: AbstractQuestionController = new AbstractQuestionController();

    /** define a static instance of Question24Controller */
    // tslint:disable-next-line:max-line-length
    export const Question24Instance: Question24Controller = new Question24Controller();

    /** define a static instance of QuestionLittleAppController */
    // tslint:disable-next-line:max-line-length
    export const QuestionLittleAppInstance: QuestionLittleAppController = new QuestionLittleAppController();

    /** define a static instance of QuestionLittleAppWechatUserController */
    // tslint:disable-next-line:max-line-length
    export const QuestionLittleAppWechatUserInstance: QuestionLittleAppWechatUserController = new QuestionLittleAppWechatUserController();

    /** define a static instance of QuestionWechatOrderController */
    // tslint:disable-next-line:max-line-length
    export const QuestionWechatOrderInstance: QuestionWechatOrderController = new QuestionWechatOrderController();

    /** define a static instance of ApkRuntimeConfigQueryController */
    // tslint:disable-next-line:max-line-length
    export const ApkRuntimeConfigQueryInstance: ApkRuntimeConfigQueryController = new ApkRuntimeConfigQueryController();

    /** define a static instance of AdController */
    export const AdInstance: AdController = new AdController();

    /** define a static instance of EpaylinksController */
    // tslint:disable-next-line:max-line-length
    export const EpaylinksInstance: EpaylinksController = new EpaylinksController();

    /** define a static instance of PartnerAdminController */
    // tslint:disable-next-line:max-line-length
    export const PartnerAdminInstance: PartnerAdminController = new PartnerAdminController();

    /** define a static instance of ScreenTextController */
    // tslint:disable-next-line:max-line-length
    export const ScreenTextInstance: ScreenTextController = new ScreenTextController();

    /** define a static instance of MachineUserModifyController */
    // tslint:disable-next-line:max-line-length
    export const MachineUserModifyInstance: MachineUserModifyController = new MachineUserModifyController();

    /** define a static instance of PlaySchemaViewController */
    // tslint:disable-next-line:max-line-length
    export const PlaySchemaViewInstance: PlaySchemaViewController = new PlaySchemaViewController();

    /** define a static instance of AdvplatformController */
    // tslint:disable-next-line:max-line-length
    export const AdvplatformInstance: AdvplatformController = new AdvplatformController();

    /** define a static instance of XiansotongController */
    // tslint:disable-next-line:max-line-length
    export const XiansotongInstance: XiansotongController = new XiansotongController();

    /** define a static instance of ChartDataController */
    // tslint:disable-next-line:max-line-length
    export const ChartDataInstance: ChartDataController = new ChartDataController();

    /** define a static instance of DeviceController */
    export const DeviceInstance: DeviceController = new DeviceController();

    /** define a static instance of EntityOperateController */
    // tslint:disable-next-line:max-line-length
    export const EntityOperateInstance: EntityOperateController = new EntityOperateController();

    /** define a static instance of EntityTypeVueDefineController */
    // tslint:disable-next-line:max-line-length
    export const EntityTypeVueDefineInstance: EntityTypeVueDefineController = new EntityTypeVueDefineController();

    /** define a static instance of EntityQueryController */
    // tslint:disable-next-line:max-line-length
    export const EntityQueryInstance: EntityQueryController = new EntityQueryController();

    /** define a static instance of EntityModifyController */
    // tslint:disable-next-line:max-line-length
    export const EntityModifyInstance: EntityModifyController = new EntityModifyController();

    /** define a static instance of MachineOrDevicePlayQueryController */
    // tslint:disable-next-line:max-line-length
    export const MachineOrDevicePlayQueryInstance: MachineOrDevicePlayQueryController = new MachineOrDevicePlayQueryController();

    /** define a static instance of MachineQueryController */
    // tslint:disable-next-line:max-line-length
    export const MachineQueryInstance: MachineQueryController = new MachineQueryController();

    /** define a static instance of MachineOperateController */
    // tslint:disable-next-line:max-line-length
    export const MachineOperateInstance: MachineOperateController = new MachineOperateController();

    /** define a static instance of PlaySchemaQueryController */
    // tslint:disable-next-line:max-line-length
    export const PlaySchemaQueryInstance: PlaySchemaQueryController = new PlaySchemaQueryController();

    /** define a static instance of MobileChargeController */
    // tslint:disable-next-line:max-line-length
    export const MobileChargeInstance: MobileChargeController = new MobileChargeController();

    /** define a static instance of WechatPayNotifyController */
    // tslint:disable-next-line:max-line-length
    export const WechatPayNotifyInstance: WechatPayNotifyController = new WechatPayNotifyController();

    /** define a static instance of WechatOrderController */
    // tslint:disable-next-line:max-line-length
    export const WechatOrderInstance: WechatOrderController = new WechatOrderController();

    /** define a static instance of KuaifaController */
    export const KuaifaInstance: KuaifaController = new KuaifaController();

    /** define a static instance of YingfeiController */
    export const YingfeiInstance: YingfeiController = new YingfeiController();

    /** define a static instance of AdminAssistantController */
    // tslint:disable-next-line:max-line-length
    export const AdminAssistantInstance: AdminAssistantController = new AdminAssistantController();

    /** define a static instance of ApkRuntimeConfigController */
    // tslint:disable-next-line:max-line-length
    export const ApkRuntimeConfigInstance: ApkRuntimeConfigController = new ApkRuntimeConfigController();

    /** define a static instance of ApkUploadController */
    // tslint:disable-next-line:max-line-length
    export const ApkUploadInstance: ApkUploadController = new ApkUploadController();

    /** define a static instance of AnanymousAssistantController */
    // tslint:disable-next-line:max-line-length
    export const AnanymousAssistantInstance: AnanymousAssistantController = new AnanymousAssistantController();

    /** define a static instance of BoxProductController */
    // tslint:disable-next-line:max-line-length
    export const BoxProductInstance: BoxProductController = new BoxProductController();

    /** define a static instance of CooperatePromoteController */
    // tslint:disable-next-line:max-line-length
    export const CooperatePromoteInstance: CooperatePromoteController = new CooperatePromoteController();

    /** define a static instance of MachineUserOperateController */
    // tslint:disable-next-line:max-line-length
    export const MachineUserOperateInstance: MachineUserOperateController = new MachineUserOperateController();

    /** define a static instance of SceneController */
    export const SceneInstance: SceneController = new SceneController();

    /** define a static instance of SimpleEntityQueryController */
    // tslint:disable-next-line:max-line-length
    export const SimpleEntityQueryInstance: SimpleEntityQueryController = new SimpleEntityQueryController();

    /** define a static instance of PreOrderController */
    // tslint:disable-next-line:max-line-length
    export const PreOrderInstance: PreOrderController = new PreOrderController();

    /** define a static instance of SalesOrderController */
    // tslint:disable-next-line:max-line-length
    export const SalesOrderInstance: SalesOrderController = new SalesOrderController();

    /** define a static instance of PlayStatisticsController */
    // tslint:disable-next-line:max-line-length
    export const PlayStatisticsInstance: PlayStatisticsController = new PlayStatisticsController();

    /** define a static instance of BonusController */
    export const BonusInstance: BonusController = new BonusController();

    /** define a static instance of DebugController */
    export const DebugInstance: DebugController = new DebugController();

    /** define a static instance of MachineUserQueryController */
    // tslint:disable-next-line:max-line-length
    export const MachineUserQueryInstance: MachineUserQueryController = new MachineUserQueryController();

    /** define a static instance of EhayQrcodeController */
    // tslint:disable-next-line:max-line-length
    export const EhayQrcodeInstance: EhayQrcodeController = new EhayQrcodeController();

    /** define a static instance of TestxController */
    export const TestxInstance: TestxController = new TestxController();

    /** define a static instance of YouzanController */
    export const YouzanInstance: YouzanController = new YouzanController();

    /** define a static instance of ZhongmengController */
    // tslint:disable-next-line:max-line-length
    export const ZhongmengInstance: ZhongmengController = new ZhongmengController();

    /** define a static instance of WcPartnerController */
    // tslint:disable-next-line:max-line-length
    export const WcPartnerInstance: WcPartnerController = new WcPartnerController();

    /** define a static instance of WechatBuyController */
    // tslint:disable-next-line:max-line-length
    export const WechatBuyInstance: WechatBuyController = new WechatBuyController();

    /** define a static instance of EntityController */
    export const EntityInstance: EntityController = new EntityController();

    /** define a static instance of SimController */
    export const SimInstance: SimController = new SimController();

    /** define a static instance of WaterAdminController */
    // tslint:disable-next-line:max-line-length
    export const WaterAdminInstance: WaterAdminController = new WaterAdminController();

    /** define a static instance of PlaySchemaController */
    // tslint:disable-next-line:max-line-length
    export const PlaySchemaInstance: PlaySchemaController = new PlaySchemaController();

    /** define a static instance of UserInfoController */
    // tslint:disable-next-line:max-line-length
    export const UserInfoInstance: UserInfoController = new UserInfoController();

    /** define a static instance of MachineOrDeviceOperateController */
    // tslint:disable-next-line:max-line-length
    export const MachineOrDeviceOperateInstance: MachineOrDeviceOperateController = new MachineOrDeviceOperateController();

    /** define a static instance of UploadController */
    export const UploadInstance: UploadController = new UploadController();

    /** define a static instance of MediaAdminController */
    // tslint:disable-next-line:max-line-length
    export const MediaAdminInstance: MediaAdminController = new MediaAdminController();

    /** define a static instance of DeviceQueryController */
    // tslint:disable-next-line:max-line-length
    export const DeviceQueryInstance: DeviceQueryController = new DeviceQueryController();

    /** define a static instance of EhayLoginController */
    // tslint:disable-next-line:max-line-length
    export const EhayLoginInstance: EhayLoginController = new EhayLoginController();

    /** define a static instance of OperateStatisticsController */
    // tslint:disable-next-line:max-line-length
    export const OperateStatisticsInstance: OperateStatisticsController = new OperateStatisticsController();

    /** define a static instance of ValuesController */
    export const ValuesInstance: ValuesController = new ValuesController();

}
export namespace EhayWebApi.WorkbookReport {
    // tslint:disable-next-line:class-name
    export class ReportSender extends EhayWebApi.Controllers.AbstractBaseController {

        /** define the constructor of ReportSender */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "ReportSender",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param context without remark
         *   @param date without remark
         */
        SendReport(context: Entitys.Null_Or_EhayContextInEhayModelModels,date: Entitys.Null_Or_String): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"context"},{"fromDefine":{},"name":"date"}];
            actionInfo.inParameterDefines[0].value = context;
            actionInfo.inParameterDefines[1].value = date;
            return this.callAction(actionInfo);
        }
    }
    /** define a static instance of ReportSender */
    export const ReportSenderInstance: ReportSender = new ReportSender();

}
export namespace EhayWebApi.WechatWork {
    // tslint:disable-next-line:class-name
    export abstract class AbstractWorkMessageController<T> extends Hongbo.HongboRootControl {

        /** define the constructor of AbstractWorkMessageController`1 */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractWorkMessageController`1",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class TestWechatWorkController extends AbstractWorkMessageController<Entitys.Null_Or_TestWechatWorkMessageHandlerInEhayWebApiWechatWork> {

        /** define the constructor of TestWechatWorkController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "TestWechatWorkController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class DeviceDevelopMessageController extends AbstractWorkMessageController<Entitys.Null_Or_DeviceDevelopMessageHandlerInEhayWebApiWechatWork> {

        /** define the constructor of DeviceDevelopMessageController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "DeviceDevelopMessageController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class BoxAppMessageController extends AbstractWorkMessageController<Entitys.Null_Or_BoxAppMessageHandlerInEhayWebApiWechatWork> {

        /** define the constructor of BoxAppMessageController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "BoxAppMessageController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    /** define a static instance of TestWechatWorkController */
    // tslint:disable-next-line:max-line-length
    export const TestWechatWorkInstance: TestWechatWorkController = new TestWechatWorkController();

    /** define a static instance of DeviceDevelopMessageController */
    // tslint:disable-next-line:max-line-length
    export const DeviceDevelopMessageInstance: DeviceDevelopMessageController = new DeviceDevelopMessageController();

    /** define a static instance of BoxAppMessageController */
    // tslint:disable-next-line:max-line-length
    export const BoxAppMessageInstance: BoxAppMessageController = new BoxAppMessageController();

}
export namespace EhayWebApi.WechatMp {
    // tslint:disable-next-line:max-line-length & class-name
    export abstract class AbstractWechatMpMessageController<TMessageContext,TMessageHandle> extends EhayWebApi.Controllers.AbstractWechatMpController {

        /** define the constructor of AbstractWechatMpMessageController`2 */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractWechatMpMessageController`2",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param signature without remark
         *   @param timestamp without remark
         *   @param nonce without remark
         *   @param echostr without remark
         */
        // tslint:disable-next-line:max-line-length
        Get(signature: Entitys.Null_Or_String,timestamp: Entitys.Null_Or_String,nonce: Entitys.Null_Or_String,echostr: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"ActionNameContent":"Index"};
            actionInfo.httpMethod = {"IsHttpGet":true};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"signature"},{"fromDefine":{},"name":"timestamp"},{"fromDefine":{},"name":"nonce"},{"fromDefine":{},"name":"echostr"}];
            actionInfo.inParameterDefines[0].value = signature;
            actionInfo.inParameterDefines[1].value = timestamp;
            actionInfo.inParameterDefines[2].value = nonce;
            actionInfo.inParameterDefines[3].value = echostr;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param postModel without remark
         */
        Post(postModel: Entitys.Null_Or_PostModelInSenparcWeixinMPEntitiesRequest): Promise<Entitys.Null_Or_ActionResultInSystemWebMvc> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"ActionNameContent":"Index"};
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"postModel"}];
            actionInfo.inParameterDefines[0].value = postModel;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class HandPickController extends AbstractWechatMpMessageController<Entitys.Null_Or_CustomerMessageContextInEhayWebApiWechatMp,Entitys.Null_Or_MaxmediaHandPickMpMessageHandlerInEhayWebApiWechatMp> {

        /** define the constructor of HandPickController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "HandPickController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class WhMediaMpController extends AbstractWechatMpMessageController<Entitys.Null_Or_CustomerMessageContextInEhayWebApiWechatMp,Entitys.Null_Or_WhMediaMpMessageHandlerInEhayWebApiWechatMp> {

        /** define the constructor of WhMediaMpController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "WhMediaMpController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class MaxmediaMpController extends AbstractWechatMpMessageController<Entitys.Null_Or_CustomerMessageContextInEhayWebApiWechatMp,Entitys.Null_Or_MaxmediaMpMessageHandlerInEhayWebApiWechatMp> {

        /** define the constructor of MaxmediaMpController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "MaxmediaMpController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    /** define a static instance of HandPickController */
    // tslint:disable-next-line:max-line-length
    export const HandPickInstance: HandPickController = new HandPickController();

    /** define a static instance of WhMediaMpController */
    // tslint:disable-next-line:max-line-length
    export const WhMediaMpInstance: WhMediaMpController = new WhMediaMpController();

    /** define a static instance of MaxmediaMpController */
    // tslint:disable-next-line:max-line-length
    export const MaxmediaMpInstance: MaxmediaMpController = new MaxmediaMpController();

}
export namespace EhayWebApi.DataImport {
    // tslint:disable-next-line:class-name
    export class DataImportController extends EhayWebApi.Controllers.AbstractBaseController {

        /** define the constructor of DataImportController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "DataImportController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark */
        // tslint:disable-next-line:max-line-length
        GetDataimportDefine(): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<Array<Entitys.EhayWebApi.Model.DataimportDefineAttribute>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export abstract class AbstractDataImportController<T,K> extends EhayWebApi.Controllers.AbstractBaseController {

        /** define the constructor of AbstractDataImportController`2 */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractDataImportController`2",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class DeviceApplyLouxiaoerImportRecordController extends AbstractDataImportController<Entitys.Null_Or_DeviceApplyLouxiaoerImportRecordInEhayWebApiDataImport,Entitys.Null_Or_NoUseDataImportOptionInEhayWebApiDataImport> {

        /** define the constructor of DeviceApplyLouxiaoerImportRecordController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "DeviceApplyLouxiaoerImportRecordController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class DeviceApplyNanduImportRecordController extends AbstractDataImportController<Entitys.Null_Or_DeviceApplyNanduImportRecordInEhayWebApiDataImport,Entitys.Null_Or_NoUseDataImportOptionInEhayWebApiDataImport> {

        /** define the constructor of DeviceApplyNanduImportRecordController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "DeviceApplyNanduImportRecordController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class EveryDayOperatePlanController extends AbstractDataImportController<Entitys.Null_Or_EveryDayOperatePlanRecordInEhayWebApiDataImport,Entitys.Null_Or_EveryDayOperatePlanOptionInEhayWebApiDataImport> {

        /** define the constructor of EveryDayOperatePlanController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "EveryDayOperatePlanController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    /** define a static instance of DataImportController */
    // tslint:disable-next-line:max-line-length
    export const DataImportInstance: DataImportController = new DataImportController();

    /** define a static instance of DeviceApplyLouxiaoerImportRecordController */
    // tslint:disable-next-line:max-line-length
    export const DeviceApplyLouxiaoerImportRecordInstance: DeviceApplyLouxiaoerImportRecordController = new DeviceApplyLouxiaoerImportRecordController();

    /** define a static instance of DeviceApplyNanduImportRecordController */
    // tslint:disable-next-line:max-line-length
    export const DeviceApplyNanduImportRecordInstance: DeviceApplyNanduImportRecordController = new DeviceApplyNanduImportRecordController();

    /** define a static instance of EveryDayOperatePlanController */
    // tslint:disable-next-line:max-line-length
    export const EveryDayOperatePlanInstance: EveryDayOperatePlanController = new EveryDayOperatePlanController();

}
export namespace EhayWebApi.EhayWechatLittleapp {
    // tslint:disable-next-line:max-line-length & class-name
    export class AdvplatformLittleAppController extends Hongbo.WechatMvc.Littleapp.AbstractWechatLittleAppMessageController<Entitys.Null_Or_CustomerWxOpenMessageContextInHongboWechatLittleApp,Entitys.Null_Or_WechatLittleAppMessageHandleInHongboWechatMvcLittleapp> {

        /** define the constructor of AdvplatformLittleAppController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AdvplatformLittleAppController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    /** define a static instance of AdvplatformLittleAppController */
    // tslint:disable-next-line:max-line-length
    export const AdvplatformLittleAppInstance: AdvplatformLittleAppController = new AdvplatformLittleAppController();

}
export namespace EhayWebApi.Controllers.WechatOrder {
    // tslint:disable-next-line:class-name
    export class RfidCupController extends EhayWebApi.Controllers.AbstractAsyncRawDataController {

        /** define the constructor of RfidCupController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "RfidCupController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark
         *   @param machineName without remark
         *   @param rfid without remark
         */
        Info(machineName: Entitys.Null_Or_String,rfid: Entitys.Null_Or_String): Promise<Entitys.Null_Or_JsonOperResultInEhayModelModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"info/{machineName}/{rfid}"};
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"machineName"},{"fromDefine":{},"name":"rfid"}];
            actionInfo.inParameterDefines[0].value = machineName;
            actionInfo.inParameterDefines[1].value = rfid;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param content without remark
         */
        Upload(content: Entitys.Null_Or_String): Promise<Entitys.Null_Or_JsonOperResultInEhayModelModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"upload"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"content"}];
            actionInfo.inParameterDefines[0].value = content;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param idArray without remark
         *   @param attr without remark
         *   @param inputParameter without remark
         *   @param inputContext without remark
         */
        // tslint:disable-next-line:max-line-length
        WithdrawRfidCupBindWcuser(idArray: Array<Entitys.Null_Or_String>,attr: Entitys.Null_Or_AbstractEntitysOperateDefineAttributeInHongboMvcAttributes,inputParameter: Entitys.Null_Or_String,inputContext: Entitys.Null_Or_UserContextInEhayModelModels): Promise<Entitys.Null_Or_GenericJsonResponseInEhayModelModels<string>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"idArray"},{"fromDefine":{},"name":"attr"},{"fromDefine":{},"name":"inputParameter"},{"fromDefine":{},"name":"inputContext"}];
            actionInfo.inParameterDefines[0].value = idArray;
            actionInfo.inParameterDefines[1].value = attr;
            actionInfo.inParameterDefines[2].value = inputParameter;
            actionInfo.inParameterDefines[3].value = inputContext;
            return this.callAction(actionInfo);
        }
    }
    /** define a static instance of RfidCupController */
    export const RfidCupInstance: RfidCupController = new RfidCupController();

}
