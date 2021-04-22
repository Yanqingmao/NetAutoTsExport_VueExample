import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import jquery from "jquery";

export namespace Hongbo {
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
    /** how send request to server */
    export enum EnumRequestMode {
        /** Axios， https://github.com/axios/axios */
        Axios = 0,
        /** jQuery，https://jquery.com */
        Jquery = 1,
        /** Browser Fetch, https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch  */
        Fetch = 2,
        /** UniApp, see the https://uniapp.dcloud.io/ */
        UniApp,
        /** WechatLittleApp, see the https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html */
        WechatLittleapp
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
    type PrehandleRequestType = null | ((url: string, content: IMethodBodyHeader, request: any) => any);
    /** RootController define, all control should extends from this implicit or explicit */
    export class HongboRootControl {
        /** the base url  */
        static BaseUrl: string = "http://localhost";

        /** the default MVC route, see the Startups.cs or RouteConfig.cs, if option, please assign the id?  */
        static DefaulMvctRoute: string = "{controller}/{action}/{id?}";

        /** the default MVC route, see the Startups.cs or WebApiConfig.cs, if option, please assign the id?  */
        static DefaulWebapitRoute: string = "api/{controller}/{id}";

        /** 发送请求之前的全局预处理,静态函数 */
        static BeforeRequest(url: string, content: IMethodBodyHeader, requestOption: any): any {
            return requestOption;
        }

        /** which library will be used to send request to server, default will use the fetch of in browser */
        static DefaulRequestMode: EnumRequestMode = EnumRequestMode.Fetch;

        /** the type name of Controller */
        public controlTypeName: string = "";

        /** .net environment, default will be the .NetCore  */
        public environment: EnumEnvironment = EnumEnvironment.NetCore;

        /** the mode of Controller, default will be the WebApi */
        public controlMode: EnumControlMode = EnumControlMode.WebApi;

        /** ths route defined on Controller */
        public routeDefine?: IRouteDefine;

        /** 发送请求之前的全局预处理,静态函数 */
        beforeRequest(url: string, content: IMethodBodyHeader, requestOption: any): any {
            return requestOption;
        }

        /**
         * execute the action
         */
        callAction(actionDefine: HongboRootAction): Promise<any> {
            let url: string = "";
            if (this.controlMode === EnumControlMode.Mvc) { url = RouteUtil.calculateMvcUrl(this, actionDefine); } else
                if (this.controlMode === EnumControlMode.WebApi) { url = RouteUtil.calculateWebApiUrl(this, actionDefine); } else {
                    throw "We're sorry, the signalR will supported soon.";
                }
            if (HongboRootControl.BaseUrl.endsWith("/") || url.startsWith("/")) {
                url = HongboRootControl.BaseUrl + url;
            } else {
                url = HongboRootControl.BaseUrl + "/" + url;
            }
            let content: IMethodBodyHeader = ContentUtil.calculateMethodBodyHead(this, actionDefine);
            let prehandleRequest: PrehandleRequestType = (url, content, request) => {
                request = HongboRootControl.BeforeRequest(url, content, request);
                request = this.beforeRequest(url, content, request);
                return request;
            };
            try {
                if (HongboRootControl.DefaulRequestMode === EnumRequestMode.Fetch) {
                    return HongboRootControl.requestWithFetch(url, content, prehandleRequest);
                }
                if (HongboRootControl.DefaulRequestMode === EnumRequestMode.Axios) {
                    return HongboRootControl.requestWithAxios(url, content);
                }
                if (HongboRootControl.DefaulRequestMode === EnumRequestMode.Jquery) {
                    return HongboRootControl.requestWithJquery(url, content);
                }
                if (HongboRootControl.DefaulRequestMode === EnumRequestMode.UniApp) {
                    return HongboRootControl.requestWithUniapp(url, content);
                }
                if (HongboRootControl.DefaulRequestMode === EnumRequestMode.WechatLittleapp) {
                    return HongboRootControl.requestWithWechatLittleapp(url, content);
                }
                throw "Unspoort request library, please email to 54924185@qq.com for advanced help";
            } catch (e) {
                return Promise.reject(e);
            }
        }
        static async requestWithFetch(url: string, content: IMethodBodyHeader, beforeRequest: PrehandleRequestType): Promise<any> {
            let request: Request = new Request(url, {
                method: content.method,
                headers: content.headers,
                body: content.body
                // mode: "no-cors"
            });
            request = HongboRootControl.BeforeRequest(url, content, request);
            if (beforeRequest) { request = beforeRequest(url, content, request); }
            let result: Response = await fetch(request);
            return result.json();
        }
        static async requestWithAxios(url: string, content: IMethodBodyHeader): Promise<any> {
            let axiosConfig: AxiosRequestConfig = {
                method: content.method as Method,
                url: url,
                headers: content.headers,
                data: content.body
            };
            axiosConfig = HongboRootControl.BeforeRequest(url, content, axiosConfig);
            let result: AxiosResponse<any> = await axios.request(axiosConfig);
            return result.data;
        }
        static requestWithJquery(url: string, content: IMethodBodyHeader): Promise<any> {
            let jqueryConfig: JQuery.AjaxSettings = {
                type: content.method,
                url: url,
                headers: content.headers,
                data: content.body
            };
            let jqXHR: JQuery.jqXHR = jquery.ajax(jqueryConfig);
            return (jqXHR.promise() as any) as Promise<any>;
        }
        static async requestWithUniapp(url: string, content: IMethodBodyHeader): Promise<any> {
            let uniRequest: UniApp.RequestOptions = {
                method: content.method as "OPTIONS" | "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT",
                url: url,
                header: content.headers,
                data: content.body,
                dataType: "json"
            };
            let result: any = await uni.request(uniRequest);
            if (result[0]) { return result[0]; }
            return result[1].data;
        }
        static async requestWithWechatLittleapp(url: string, content: IMethodBodyHeader): Promise<any> {
            let uniRequest: WechatMiniprogram.RequestOption = {
                method: content.method as "OPTIONS" | "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT",
                url: url,
                header: content.headers,
                data: content.body,
                dataType: "json"
            };
            let result: any = await wx.request(uniRequest);
            if (result[0]) { return result[0]; }
            return result[1].data;
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
        static calculateMethodBodyHead(controlDefine: HongboRootControl, actionDefine: HongboRootAction): IMethodBodyHeader {
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
        static calculateMethod(controlDefine: HongboRootControl, actionDefine: HongboRootAction): string {
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
        static calculateWebApiUrl(controlDefine: HongboRootControl, actionDefine: HongboRootAction): string {
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
        static calculateMvcUrl(controlDefine: HongboRootControl, actionDefine: HongboRootAction): string {
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
        private static combineFromQueryParameter(controlDefine: HongboRootControl, actionDefine: HongboRootAction): string {
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
        private static parceRouteArea(controlDefine: HongboRootControl, actionDefine: HongboRootAction): string {
            if (controlDefine.routeDefine && controlDefine.routeDefine.RouteAreaContent) {
                return RouteUtil.parceRouteTemplate(controlDefine.routeDefine.RouteAreaContent, controlDefine, actionDefine) + "/";
            }
            return "";
        }
        /** 解析 routePrefix 路由定义 */
        private static parceRoutePrefix(controlDefine: HongboRootControl, actionDefine: HongboRootAction): string {
            if (controlDefine && controlDefine.routeDefine && controlDefine.routeDefine.RoutePrefixDefine) { //
                return `${controlDefine.routeDefine.RoutePrefixDefine}` + "/";
            }
            return "";
        }

        /** 解析 action 上的 route 路由定义 */
        private static parceActionRoute(controlDefine: HongboRootControl, actionDefine: HongboRootAction): string {
            if (actionDefine.routeDefine && actionDefine.routeDefine.RouteContent) {
                return RouteUtil.parceRouteTemplate(actionDefine.routeDefine.RouteContent, controlDefine, actionDefine);
            }
            return "";
        }

        /** 解析 controller 上的 route 路由定义 */
        static parceControllerRoute(controlDefine: HongboRootControl, actionDefine: HongboRootAction): string {
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
        public static parceRouteTemplate(template: string, control: HongboRootControl, actionDefine: HongboRootAction): string {
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