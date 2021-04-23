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
                url = Lll111lll111l111111l11.lll1l1l1111l111l111l1(this.controlOption, actionDefine);
            } else if (this.controlOption.controlMode === EnumControlMode.WebApi) {
                url = Lll111lll111l111111l11.llll11111l1111ll1l11l(this.controlOption, actionDefine);
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
            let content: IMethodBodyHeader = Lll1lll1l1l111l1l111l1.l11ll1lll111l1l11l11l(this.controlOption, actionDefine);
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
    /** 根据 ControlDefine 和 ActionDefine 获取 Http Header 定义的工具类
     *  ContentUtil
     */
    export class Lll1lll1l1l111l1l111l1 {
        /**
         * 根据 ControlDefine 和 ActionDefine 计算 Http Header
         * @returns Record<string, string>
         */
        // tslint:disable-next-line:max-line-length
        static l11ll1lll111l1l11l11l(lll1111l11111111111l1: IControlOption, l1lll1ll1lll1l1ll1ll1: HongboRootAction): IMethodBodyHeader { let l11llllllll1l111ll1l1: string = Lll1lll1l1l111l1l111l1.l1111ll11lll1llll1lll(lll1111l11111111111l1, l1lll1ll1lll1l1ll1ll1); let ll111ll1l1l111ll11111: Record<string, string> = {}; let l1l11l1llll11ll11llll: IActionParameterDefine[] = l1lll1ll1lll1l1ll1ll1.inParameterDefines; ll111ll1l1l111ll11111.Accept = "application/json"; Lll1lll1l1l111l1l111l1.ll1lll1ll1l1111l1llll(l1lll1ll1lll1l1ll1ll1, ll111ll1l1l111ll11111); if (l11llllllll1l111ll1l1 === "get") { return { method: l11llllllll1l111ll1l1, headers: ll111ll1l1l111ll11111 }; } Ll1l11l11111l1llll1lll.info(l1l11l1llll11ll11llll); let l1lll1ll1l1ll1111llll: IActionParameterDefine[] = l1l11l1llll11ll11llll.filter((ll1l111l11l111111111l) => { if (ll1l111l11l111111111l.value === undefined) { return false; } let ll1ll1l1ll1l1111l1111: IParameterFromDefine | undefined = ll1l111l11l111111111l.fromDefine; if (ll1ll1l1ll1l1111l1111 && ll1ll1l1ll1l1111l1111.IsFromBody) { return true; } return false; }); if (l1lll1ll1l1ll1111llll.length > 0) { ll111ll1l1l111ll11111["Content-Type"] = "application/json"; let llll111ll1ll11l111ll1: string = JSON.stringify(l1lll1ll1l1ll1111llll[0].value); return { method: l11llllllll1l111ll1l1, body: llll111ll1ll11l111ll1, headers: ll111ll1l1l111ll11111 }; } ll111ll1l1l111ll11111["Content-Type"] = "application/x-www-form-urlencoded"; let ll1l111ll111llll1l1ll: FormData = new FormData(); Ll1l11l11111l1llll1lll.info("参数", JSON.stringify(l1l11l1llll11ll11llll)); let ll11l11ll1ll1ll111ll1: IActionParameterDefine[] = l1l11l1llll11ll11llll.filter((l1ll1lll11lllllll11ll) => !l1ll1lll11lllllll11ll.filledToRoute && !l1ll1lll11lllllll11ll.filledToQuery && !l1ll1lll11lllllll11ll.filledToHead && (l1ll1lll11lllllll11ll.value !== undefined)); Ll1l11l11111l1llll1lll.info("剩余未填充到路由、query、Header 的参数", ll11l11ll1ll1ll111ll1); ll11l11ll1ll1ll111ll1.forEach((l1111lllllllllll111ll) => { if (l1111lllllllllll111ll.value !== undefined) { let ll1ll1l111111l1111lll: any = l1111lllllllllll111ll.value; if (typeof (ll1ll1l111111l1111lll) === "string" || typeof (ll1ll1l111111l1111lll) === "number" || typeof (ll1ll1l111111l1111lll) === "boolean") { Ll1l11l11111l1llll1lll.info("添加参数和值到 formBody:" + l1111lllllllllll111ll.name + "=" + ll1ll1l111111l1111lll); ll1l111ll111llll1l1ll.set(l1111lllllllllll111ll.name, "" + ll1ll1l111111l1111lll); } else if (ll1ll1l111111l1111lll !== null) { ll111ll1l1l111ll11111["Content-Type"] = "multipart/form-data"; if (ll1ll1l111111l1111lll.size && ll1ll1l111111l1111lll.name && ll1ll1l111111l1111lll.lastModified) { ll1l111ll111llll1l1ll.set(l1111lllllllllll111ll.name, ll1ll1l111111l1111lll, ll1ll1l111111l1111lll.name); } else { Ll1l11l11111l1llll1lll.info("添加参数和值到 formBody:" + l1111lllllllllll111ll.name + "=" + JSON.stringify(ll1ll1l111111l1111lll)); ll1l111ll111llll1l1ll.append(l1111lllllllllll111ll.name, JSON.stringify(ll1ll1l111111l1111lll)); Ll1l11l11111l1llll1lll.info("添加了参数和值后的 formBody:", ll1l111ll111llll1l1ll); } } } }); return { method: l11llllllll1l111ll1l1, body: ll1l111ll111llll1l1ll, headers: ll111ll1l1l111ll11111 }; }
        // tslint:disable-next-line:max-line-length
        static ll1lll1ll1l1111l1llll(ll11l1l1llllll1ll1lll: HongboRootAction, l1l1l111l11ll1l111l1l: Record<string, string>): void { let lll1l11ll11ll1l1111ll: IActionParameterDefine[] = ll11l1l1llllll1ll1lll.inParameterDefines; let llll1ll1l1ll111l11lll: IActionParameterDefine[] = lll1l11ll11ll1l1111ll.filter((l1l11l1llll11ll11llll) => { let l1lll1ll1lll1l1ll1ll1: IParameterFromDefine | undefined = l1l11l1llll11ll11llll.fromDefine; if (l1lll1ll1lll1l1ll1ll1 && l1lll1ll1lll1l1ll1ll1.IsFromHeader) { return true; } return false; }); llll1ll1l1ll111l11lll.forEach(l11llllllll1l111ll1l1 => { l11llllllll1l111ll1l1.filledToHead = true; if (l11llllllll1l111ll1l1.value !== undefined) { l1l1l111l11ll1l111l1l[l11llllllll1l111ll1l1.name] = l11llllllll1l111ll1l1.value; } }); }
        // tslint:disable-next-line:max-line-length
        static l1111ll11lll1llll1lll(lll1111l11111111111l1: IControlOption, l1lll1ll1lll1l1ll1ll1: HongboRootAction): string { let l11llllllll1l111ll1l1: IActionParameterDefine[] = l1lll1ll1lll1l1ll1ll1.inParameterDefines; let ll111ll1l1l111ll11111: IHttpMethodDefine | undefined = l1lll1ll1lll1l1ll1ll1.httpMethod; if (ll111ll1l1l111ll11111) { if (ll111ll1l1l111ll11111.IsHttpGet) { return "get"; } if (ll111ll1l1l111ll11111.IsHttpDelete) { return "delete"; } if (ll111ll1l1l111ll11111.IsHttpHead) { return "head"; } if (ll111ll1l1l111ll11111.IsHttpOptions) { return "options"; } if (ll111ll1l1l111ll11111.IsHttpPatch) { return "patch"; } if (ll111ll1l1l111ll11111.IsHttpPut) { return "put"; } if (ll111ll1l1l111ll11111.IsHttpPost) { return "post"; } } if (l11llllllll1l111ll1l1.filter((l1lll1ll1l1ll1111llll) => { let l1l11l1llll11ll11llll: IParameterFromDefine | undefined = l1lll1ll1l1ll1111llll.fromDefine; if (l1l11l1llll11ll11llll && (l1l11l1llll11ll11llll.IsFromBody || l1l11l1llll11ll11llll.IsFromForm)) { return true; } let l1ll1lll11lllllll11ll: any = l1lll1ll1l1ll1111llll.value; if (typeof (l1ll1lll11lllllll11ll) === "object") { return true; } return false; }).length > 0) { return "post"; } return "get"; }
    }
    // tslint:disable-next-line:max-line-length
    export class Ll1l11l11111l1llll1lll { static lll1ll1llll1ll1ll111l: boolean = false; static info(...l1llllll111lll1llll1l: any[]): void { if (this.lll1ll1llll1ll1ll111l) { console.log(JSON.stringify(l1llllll111lll1llll1l)); } } }
    // tslint:disable-next-line:max-line-length
    export class Ll111lllll1ll11l11l1l1 { ll1l1l1l1l1l111111l1l: string = ""; l11lll1111ll11l111l1l?: boolean = false; ll1ll1l111l1l1l1111ll?: boolean = false; llll1l1ll11l1lllll1ll?: string; ll111lll1l111l1l1l1l1?: IActionParameterDefine; }
    export class Lll111lll111l111111l11 {
        // tslint:disable-next-line:max-line-length
        static llll11111l1111ll1l11l(ll11l1l1l11lll1l11l11: IControlOption, ll11l1l1llllll1ll1lll: HongboRootAction): string { let l1l1l111l11ll1l111l1l: string = ""; if (ll11l1l1l11lll1l11l11.environment === EnumEnvironment.AspNet) { if (ll11l1l1l11lll1l11l11.routeDefine && ll11l1l1l11lll1l11l11.routeDefine.RoutePrefixDefine) { l1l1l111l11ll1l111l1l += `${ll11l1l1l11lll1l11l11.routeDefine.RoutePrefixDefine}/`; } let lll1l11ll11ll1l1111ll: string = Lll111lll111l111111l11.lll1l11l1lll11l1ll1l1(ll11l1l1l11lll1l11l11, ll11l1l1llllll1ll1lll); if (lll1l11ll11ll1l1111ll) { l1l1l111l11ll1l111l1l += lll1l11ll11ll1l1111ll; } else { l1l1l111l11ll1l111l1l += Lll111lll111l111111l11.ll11l111l11l1lll1l11l(ll11l1l1l11lll1l11l11, ll11l1l1llllll1ll1lll); } } else { let llll1ll1l1ll111l11lll: string = Lll111lll111l111111l11.lll1l11l1lll11l1ll1l1(ll11l1l1l11lll1l11l11, ll11l1l1llllll1ll1lll); if (llll1ll1l1ll111l11lll.startsWith("/")) { l1l1l111l11ll1l111l1l += llll1ll1l1ll111l11lll; } else { l1l1l111l11ll1l111l1l += Lll111lll111l111111l11.ll11l111l11l1lll1l11l(ll11l1l1l11lll1l11l11, ll11l1l1llllll1ll1lll); l1l1l111l11ll1l111l1l += "/" + llll1ll1l1ll111l11lll; } } if (!l1l1l111l11ll1l111l1l) { l1l1l111l11ll1l111l1l = Lll111lll111l111111l11.ll11llll111llll1lll11(HongboRootControl.DefaulWebapitRoute, ll11l1l1l11lll1l11l11, ll11l1l1llllll1ll1lll); } return l1l1l111l11ll1l111l1l; }
        // tslint:disable-next-line:max-line-length
        static lll1l1l1111l111l111l1(lll1111l11111111111l1: IControlOption, l1lll1ll1lll1l1ll1ll1: HongboRootAction): string { let l11llllllll1l111ll1l1: string = ""; if (lll1111l11111111111l1.environment === EnumEnvironment.AspNet) { l11llllllll1l111ll1l1 += Lll111lll111l111111l11.l1ll11111l1l11l1l1lll(lll1111l11111111111l1, l1lll1ll1lll1l1ll1ll1); l11llllllll1l111ll1l1 += Lll111lll111l111111l11.l11ll1111lll1lllllll1(lll1111l11111111111l1, l1lll1ll1lll1l1ll1ll1); let ll111ll1l1l111ll11111: string = Lll111lll111l111111l11.lll1l11l1lll11l1ll1l1(lll1111l11111111111l1, l1lll1ll1lll1l1ll1ll1); if (ll111ll1l1l111ll11111) { l11llllllll1l111ll1l1 += ll111ll1l1l111ll11111; } else { const l1l11l1llll11ll11llll: string = Lll111lll111l111111l11.ll11l111l11l1lll1l11l(lll1111l11111111111l1, l1lll1ll1lll1l1ll1ll1); l11llllllll1l111ll1l1 += l1l11l1llll11ll11llll; } } else { let l1lll1ll1l1ll1111llll: string = Lll111lll111l111111l11.lll1l11l1lll11l1ll1l1(lll1111l11111111111l1, l1lll1ll1lll1l1ll1ll1); if (l1lll1ll1l1ll1111llll.startsWith("/")) { l11llllllll1l111ll1l1 += l1lll1ll1l1ll1111llll; } else { l11llllllll1l111ll1l1 += Lll111lll111l111111l11.ll11l111l11l1lll1l11l(lll1111l11111111111l1, l1lll1ll1lll1l1ll1ll1); if (l1lll1ll1l1ll1111llll) { l11llllllll1l111ll1l1 = l11llllllll1l111ll1l1 + "/" + l1lll1ll1l1ll1111llll; } } } if (!l11llllllll1l111ll1l1) { l11llllllll1l111ll1l1 += Lll111lll111l111111l11.ll11llll111llll1lll11(HongboRootControl.DefaulMvctRoute, lll1111l11111111111l1, l1lll1ll1lll1l1ll1ll1); } let ll1ll1l111111l1111lll: string = Lll111lll111l111111l11.llllllll11l1l1l1l11ll(lll1111l11111111111l1, l1lll1ll1lll1l1ll1ll1); if (ll1ll1l111111l1111lll) { l11llllllll1l111ll1l1 = l11llllllll1l111ll1l1 + "?" + ll1ll1l111111l1111lll; } return l11llllllll1l111ll1l1; }
        // tslint:disable-next-line:max-line-length
        private static llllllll11l1l1l1l11ll(ll1ll1l1ll1l1111l1111: IControlOption, ll1l111l11l111111111l: HongboRootAction): string { if (ll1l111l11l111111111l.inParameterDefines) { let lll1111l11111111111l1: boolean = Lll1lll1l1l111l1l111l1.l1111ll11lll1llll1lll(ll1ll1l1ll1l1111l1111, ll1l111l11l111111111l) === "get"; let l1lll1ll1lll1l1ll1ll1: IActionParameterDefine[] = ll1l111l11l111111111l.inParameterDefines.filter((l11llllllll1l111ll1l1) => { if (l11llllllll1l111ll1l1.value === undefined) { return false; } if (l11llllllll1l111ll1l1.filledToRoute === true) { return false; } if (lll1111l11111111111l1 && !l11llllllll1l111ll1l1.fromDefine) { return true; } if (l11llllllll1l111ll1l1.fromDefine && l11llllllll1l111ll1l1.fromDefine.IsFromQuery) { return true; } return false; }); return l1lll1ll1lll1l1ll1ll1.map((l11llllllll1l111ll1l1) => { l11llllllll1l111ll1l1.filledToQuery = true; if (typeof (l11llllllll1l111ll1l1.value) === "string" || typeof (l11llllllll1l111ll1l1.value) === "number" || typeof (l11llllllll1l111ll1l1.value) === "boolean") { return encodeURI(l11llllllll1l111ll1l1.name) + "=" + encodeURI("" + l11llllllll1l111ll1l1.value); } return encodeURI(l11llllllll1l111ll1l1.name) + "=" + encodeURI(JSON.stringify(l11llllllll1l111ll1l1.value)); }).join("&"); } return ""; }
        // tslint:disable-next-line:max-line-length
        private static l1ll11111l1l11l1l1lll(ll1ll1l1ll1l1111l1111: IControlOption, ll1l111l11l111111111l: HongboRootAction): string { if (ll1ll1l1ll1l1111l1111.routeDefine && ll1ll1l1ll1l1111l1111.routeDefine.RouteAreaContent) { return Lll111lll111l111111l11.ll11llll111llll1lll11(ll1ll1l1ll1l1111l1111.routeDefine.RouteAreaContent, ll1ll1l1ll1l1111l1111, ll1l111l11l111111111l) + "/"; } return ""; }
        // tslint:disable-next-line:max-line-length
        private static l11ll1111lll1lllllll1(ll1ll1l1ll1l1111l1111: IControlOption, ll1l111l11l111111111l: HongboRootAction): string { if (ll1ll1l1ll1l1111l1111 && ll1ll1l1ll1l1111l1111.routeDefine && ll1ll1l1ll1l1111l1111.routeDefine.RoutePrefixDefine) {  return `${ll1ll1l1ll1l1111l1111.routeDefine.RoutePrefixDefine}` + "/"; } return ""; }
        // tslint:disable-next-line:max-line-length
        private static lll1l11l1lll11l1ll1l1(ll1ll1l1ll1l1111l1111: IControlOption, ll1l111l11l111111111l: HongboRootAction): string { if (ll1l111l11l111111111l.routeDefine && ll1l111l11l111111111l.routeDefine.RouteContent) { return Lll111lll111l111111l11.ll11llll111llll1lll11(ll1l111l11l111111111l.routeDefine.RouteContent, ll1ll1l1ll1l1111l1111, ll1l111l11l111111111l); } return ""; }
        // tslint:disable-next-line:max-line-length
        static ll11l111l11l1lll1l11l(ll1ll1l1ll1l1111l1111: IControlOption, ll1l111l11l111111111l: HongboRootAction): string { if (ll1ll1l1ll1l1111l1111.routeDefine && ll1ll1l1ll1l1111l1111.routeDefine.RouteContent) { return Lll111lll111l111111l11.ll11llll111llll1lll11(ll1ll1l1ll1l1111l1111.routeDefine.RouteContent, ll1ll1l1ll1l1111l1111, ll1l111l11l111111111l); } return ""; }
        // tslint:disable-next-line:max-line-length
        public static ll11llll111llll1lll11(ll1ll1l1ll1l1111l1111: string, ll1l111l11l111111111l: IControlOption, llll111ll1ll11l111ll1: HongboRootAction): string { let ll11l1l1l11lll1l11l11: IActionParameterDefine[] = llll111ll1ll11l111ll1.inParameterDefines; const l1l1l1l111111lll111ll: string = ll1ll1l1ll1l1111l1111; ll1ll1l1ll1l1111l1111 = ll1ll1l1ll1l1111l1111.replace("{controller}", ll1l111l11l111111111l.controlTypeName.replace("Controller", "")); ll1ll1l1ll1l1111l1111 = ll1ll1l1ll1l1111l1111.replace("{action}", llll111ll1ll11l111ll1.actionName ? llll111ll1ll11l111ll1.actionName : llll111ll1ll11l111ll1.name); let ll1l111ll111llll1l1ll: string[] = ll1ll1l1ll1l1111l1111.split("/"); let lll11l1ll1l11ll111l1l: Ll111lllll1ll11l11l1l1[] = ll1l111ll111llll1l1ll.map((x) => Lll111lll111l111111l11.l0o0o0o0o0o1l1l1l1l(x, ll11l1l1l11lll1l11l11)); for (let l11l1ll11l1111ll11111: number = lll11l1ll1l11ll111l1l.length - 1; l11l1ll11l1111ll11111 >= 0; l11l1ll11l1111ll11111--) { let l1l1l11ll1l11l1l1l11l: Ll111lllll1ll11l11l1l1 = lll11l1ll1l11ll111l1l[l11l1ll11l1111ll11111]; if (l1l1l11ll1l11l1l1l11l.ll1ll1l111l1l1l1111ll && l1l1l11ll1l11l1l1l11l.llll1l1ll11l1lllll1ll === undefined && l1l1l11ll1l11l1l1l11l.ll111lll1l111l1l1l1l1 === undefined) { lll11l1ll1l11ll111l1l.splice(l11l1ll11l1111ll11111, 1); } } let ll11l11ll1ll1ll111ll1: Ll111lllll1ll11l11l1l1[] = lll11l1ll1l11ll111l1l.filter((ll1ll1l111111l1111lll) => { if (ll1ll1l111111l1111lll.l11lll1111ll11l111l1l) { return true; } if (ll1ll1l111111l1111lll.llll1l1ll11l1lllll1ll === undefined && ll1ll1l111111l1111lll.ll111lll1l111l1l1l1l1 === undefined) { return false; } return true; }); let l1111lllllllllll111ll: string = ll11l11ll1ll1ll111ll1.map((lllll1llll1l11111l1ll) => { let l1ll1lll11lllllll11ll: IActionParameterDefine | undefined = lllll1llll1l11111l1ll.ll111lll1l111l1l1l1l1; if (l1ll1lll11lllllll11ll && l1ll1lll11lllllll11ll.value) { return l1ll1lll11lllllll11ll.value; } else { return lllll1llll1l11111l1ll.llll1l1ll11l1lllll1ll; } }).join("/"); return l1111lllllllllll111ll; }
        // tslint:disable-next-line:max-line-length
        public static l0o0o0o0o0o1l1l1l1l(l0o0o0o0o0o1l1l1ll1: string, l0o0o0o0o0o1l1l1lll: IActionParameterDefine[]): Ll111lllll1ll11l11l1l1 { if (l0o0o0o0o0o1l1l1ll1.startsWith("{")) {  l0o0o0o0o0o1l1l1ll1 = l0o0o0o0o0o1l1l1ll1.substring(1);  } else {  let l0o0o0o0o0o1l1l11ll: Ll111lllll1ll11l11l1l1 = { ll1l1l1l1l1l111111l1l: l0o0o0o0o0o1l1l1ll1, llll1l1ll11l1lllll1ll: l0o0o0o0o0o1l1l1ll1, l11lll1111ll11l111l1l: true };  return l0o0o0o0o0o1l1l11ll;  }  if (l0o0o0o0o0o1l1l1ll1.endsWith("}")) { l0o0o0o0o0o1l1l1ll1 = l0o0o0o0o0o1l1l1ll1.substring(0, l0o0o0o0o0o1l1l1ll1.length - 1); }  let ll1ll1l1ll1l1111l1111: string[] = l0o0o0o0o0o1l1l1ll1.split("=");  let ll1l111l11l111111111l: string = ll1ll1l1ll1l1111l1111[0];  let llll111ll1ll11l111ll1: boolean = false;  if (ll1l111l11l111111111l.indexOf(":") >= 0) {  ll1l111l11l111111111l = ll1l111l11l111111111l.substring(0, ll1l111l11l111111111l.indexOf(":"));  }  ll1l111l11l111111111l = ll1l111l11l111111111l.trim();  if (ll1l111l11l111111111l.endsWith("?")) {  llll111ll1ll11l111ll1 = true;  ll1l111l11l111111111l = ll1l111l11l111111111l.substring(0, ll1l111l11l111111111l.length - 1);  }  let ll1l111ll111llll1l1ll: Ll111lllll1ll11l11l1l1 = { ll1l1l1l1l1l111111l1l: "", ll1ll1l111l1l1l1111ll: llll111ll1ll11l111ll1 };  ll1l111ll111llll1l1ll.ll1l1l1l1l1l111111l1l = ll1l111l11l111111111l;  if (ll1ll1l1ll1l1111l1111.length > 1) {  ll1l111ll111llll1l1ll.llll1l1ll11l1lllll1ll = ll1ll1l1ll1l1111l1111[1];  }  let lll11l1ll1l11ll111l1l: number = (l0o0o0o0o0o1l1l1lll ? l0o0o0o0o0o1l1l1lll : []).findIndex((x) => x.name === ll1l111ll111llll1l1ll.ll1l1l1l1l1l111111l1l);  if (lll11l1ll1l11ll111l1l >= 0) {  let l11l1ll11l1111ll11111: IActionParameterDefine = l0o0o0o0o0o1l1l1lll[lll11l1ll1l11ll111l1l];  l11l1ll11l1111ll11111.filledToRoute = true;  ll1l111ll111llll1l1ll.ll111lll1l111l1l1l1l1 = l11l1ll11l1111ll11111;  }  return ll1l111ll111llll1l1ll;  }
    }
}

Hongbo.HongboRootControl.BaseUrl = "http://localhost/TsGenAspnetExample";
Hongbo.HongboRootControl.DefaulWebapitRoute = "api/{controller}/{id?}";
Hongbo.HongboRootControl.DefaulMvctRoute = "{controller}/{action}/{id?}";
export namespace TsGenAspnetExample.Controllers {
    // tslint:disable-next-line:class-name
    export abstract class AbstractGenericDbContextController_1<TDbContext> extends Hongbo.HongboRootControl {

        /** define the constructor of AbstractGenericDbContextController`1 */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractGenericDbContextController`1",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
        /** without remark */
        TestParent(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class HomeController extends AbstractGenericDbContextController_1<object> {

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
        /** without remark */
        // tslint:disable-next-line:max-line-length
        GenericValueType(): Promise<Entitys.System.Tuple_2<Entitys.Hongbo.Basic.Systems.CheckResult,Array<Entitys.TsGenAspnetExample.Models.Person>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param dbContext without remark
         */
        Index(): Promise<Entitys.Null_Or_DogInTsGenAspnetExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param dbContext without remark
         */
        OrderHandle(): Promise<Entitys.Null_Or_WechatOrderInTsGenAspnetExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark */
        // tslint:disable-next-line:max-line-length
        TestGenericWorkFlow(): Promise<Entitys.Null_Or_GenericWorkFlowInTsGenAspnetExampleModels<Entitys.TsGenAspnetExample.Models.Dog,Entitys.TsGenAspnetExample.Models.EnumAnimalType>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param dbContext without remark
         */
        Welcome(): Promise<any> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class TestRouteController extends Hongbo.HongboRootControl {

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
        Ask(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         */
        Hello(lang: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"hello","ActionNameContent":"h"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = lang;
            return this.callAction(actionInfo);
        }
        /** without remark */
        Index(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         *   @param name without remark
         */
        RootSay(lang: Entitys.Null_Or_String,name: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"rsay/{name=daiwei}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"},{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = lang;
            actionInfo.inParameterDefines[1].value = name;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export abstract class AbstractGenericDbContextController_2<TDbContext,TModel> extends Hongbo.HongboRootControl {

        /** define the constructor of AbstractGenericDbContextController`2 */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractGenericDbContextController`2",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.AspNet,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:max-line-length & class-name
    export class TestRouteAreaAndRoutePrefixController extends AbstractGenericDbContextController_2<object,Entitys.Null_Or_AnimalInTsGenAspnetExampleModels> {

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
        Hello(lang: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"hello","ActionNameContent":"h"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = lang;
            return this.callAction(actionInfo);
        }
        /** without remark */
        Index(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         *   @param name without remark
         */
        Say(lang: Entitys.Null_Or_String,name: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"say/{name=daiwei}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"},{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = lang;
            actionInfo.inParameterDefines[1].value = name;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         */
        World(lang: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"ActionNameContent":"h"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = lang;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class TestRouteAreaController extends Hongbo.HongboRootControl {

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
        Hello(lang: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"hello"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = lang;
            return this.callAction(actionInfo);
        }
        /** without remark */
        Index(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         *   @param name without remark
         */
        RootSay(lang: Entitys.Null_Or_String,name: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"rsay/{name=daiwei}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"},{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = lang;
            actionInfo.inParameterDefines[1].value = name;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         *   @param name without remark
         */
        Say(lang: Entitys.Null_Or_String,name: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"say/{name=daiwei}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"},{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = lang;
            actionInfo.inParameterDefines[1].value = name;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class TestRoutePrefixController extends Hongbo.HongboRootControl {

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
        Hello(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"hello"};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark */
        Index(): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param name without remark
         */
        RootSay(name: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"rsay/{name=daiwei}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = name;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param name without remark
         */
        Say(name: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"say/{name=daiwei}"};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"name"}];
            actionInfo.inParameterDefines[0].value = name;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class NoAnyAttrWebapiController extends Hongbo.HongboRootControl {

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
        Delete(id: number): Promise<Entitys.Null_Or_PersonInTsGenAspnetExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpDelete":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark */
        get(): Promise<Array<Entitys.TsGenAspnetExample.Models.Manager>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        Get(id: number): Promise<Entitys.Null_Or_PersonInTsGenAspnetExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark */
        Options(): Promise<Entitys.Null_Or_PersonInTsGenAspnetExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpOptions":true};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param value without remark
         */
        // tslint:disable-next-line:max-line-length
        Patch(id: number,value: Entitys.Null_Or_PersonInTsGenAspnetExampleModels): Promise<Entitys.Null_Or_PersonInTsGenAspnetExampleModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPatch":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = value;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param value without remark
         */
        Post(value: Entitys.Null_Or_PersonInTsGenAspnetExampleModels): Promise<Entitys.Null_Or_PersonInTsGenAspnetExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = value;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param value without remark
         */
        // tslint:disable-next-line:max-line-length
        Put(id: number,value: Entitys.Null_Or_PersonInTsGenAspnetExampleModels): Promise<Entitys.Null_Or_PersonInTsGenAspnetExampleModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPut":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = value;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class TestAreaTestPrefixValuesController extends Hongbo.HongboRootControl {

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
        Delete(id: number): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpDelete":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark */
        Get(): Promise<Array<Entitys.Null_Or_String>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        GetById(id: number): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param value without remark
         */
        Post(value: Entitys.Null_Or_String): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = value;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param value without remark
         */
        Put(id: number,value: Entitys.Null_Or_String): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPut":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = value;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class TestPrefixValuesController extends Hongbo.HongboRootControl {

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
        Delete(id: number): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpDelete":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark */
        Get(): Promise<Array<Entitys.Null_Or_String>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        GetById(id: number): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param value without remark
         */
        Post(value: Entitys.Null_Or_String): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = value;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param value without remark
         */
        Put(id: number,value: Entitys.Null_Or_String): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPut":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = value;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class NoRouteValuesController extends Hongbo.HongboRootControl {

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
        Get(id: number): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         */
        Test(lang: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = lang;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param lang without remark
         */
        TestByIdLang(id: number,lang: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = lang;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class ValuesController extends Hongbo.HongboRootControl {

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
        Get(id: number): Promise<Array<Entitys.Null_Or_String>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param lang without remark
         */
        Test(lang: Entitys.Null_Or_String): Promise<Record<string,Entitys.TsGenAspnetExample.Models.Person>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = lang;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param lang without remark
         */
        TestByIdLang(id: number,lang: Entitys.Null_Or_String): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{},"name":"lang"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = lang;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class TestAreaValuesController extends Hongbo.HongboRootControl {

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
        Delete(id: number): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpDelete":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark */
        Get(): Promise<Array<Entitys.Null_Or_String>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         */
        GetById(id: number): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param value without remark
         */
        Post(value: Entitys.Null_Or_String): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = value;
            return this.callAction(actionInfo);
        }
        /** without remark
         *   @param id without remark
         *   @param value without remark
         */
        Put(id: number,value: Entitys.Null_Or_String): Promise<Entitys.System.Void> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPut":true};
            actionInfo.inParameterDefines = [{"fromDefine":{},"name":"id"},{"fromDefine":{"IsFromBody":true},"name":"value"}];
            actionInfo.inParameterDefines[0].value = id;
            actionInfo.inParameterDefines[1].value = value;
            return this.callAction(actionInfo);
        }
    }
    /** define a static instance of HomeController */
    export const HomeInstance: HomeController = new HomeController();

    /** define a static instance of TestRouteController */
    // tslint:disable-next-line:max-line-length
    export const TestRouteInstance: TestRouteController = new TestRouteController();

    /** define a static instance of TestRouteAreaAndRoutePrefixController */
    // tslint:disable-next-line:max-line-length
    export const TestRouteAreaAndRoutePrefixInstance: TestRouteAreaAndRoutePrefixController = new TestRouteAreaAndRoutePrefixController();

    /** define a static instance of TestRouteAreaController */
    // tslint:disable-next-line:max-line-length
    export const TestRouteAreaInstance: TestRouteAreaController = new TestRouteAreaController();

    /** define a static instance of TestRoutePrefixController */
    // tslint:disable-next-line:max-line-length
    export const TestRoutePrefixInstance: TestRoutePrefixController = new TestRoutePrefixController();

    /** define a static instance of NoAnyAttrWebapiController */
    // tslint:disable-next-line:max-line-length
    export const NoAnyAttrWebapiInstance: NoAnyAttrWebapiController = new NoAnyAttrWebapiController();

    /** define a static instance of TestAreaTestPrefixValuesController */
    // tslint:disable-next-line:max-line-length
    export const TestAreaTestPrefixValuesInstance: TestAreaTestPrefixValuesController = new TestAreaTestPrefixValuesController();

    /** define a static instance of TestPrefixValuesController */
    // tslint:disable-next-line:max-line-length
    export const TestPrefixValuesInstance: TestPrefixValuesController = new TestPrefixValuesController();

    /** define a static instance of NoRouteValuesController */
    // tslint:disable-next-line:max-line-length
    export const NoRouteValuesInstance: NoRouteValuesController = new NoRouteValuesController();

    /** define a static instance of ValuesController */
    export const ValuesInstance: ValuesController = new ValuesController();

    /** define a static instance of TestAreaValuesController */
    // tslint:disable-next-line:max-line-length
    export const TestAreaValuesInstance: TestAreaValuesController = new TestAreaValuesController();

}
