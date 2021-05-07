// attention, no license/license expired, will limit 20 Controller and 100 Actions.
// please access the https://www.max-media.cc/e/tssuitapply/create apply the license or contact dear.yanqingmao@hotmail.com to extend the license.
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
    /** handle request option before request sent to the server */
    export enum EnumPreHandleOption {
        /** replace the request prehandle function forever, new function would be the global request prehandle function */
        replaceGlobalForEver = 0,
        /** replace the request prehandle function temporary,
         * the global request prehandle function would not executed when request sent to server.
         */
        replaceGlobalTemp = 1,
        /** the request prehandle function will be executed before the global request prehandle function execute
         */
        beforeGlobal,
        /** the request prehandle function will be executed after the global request prehandle function execute
         */
        afterGlobal
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

        /** the default WebApi route, see the Startups.cs or WebApiConfig.cs, if option, please assign the id?  */
        static DefaulWebapitRoute: string = "api/{controller}/{id}";

        /** Global request prehandle function */
        private static GlobalPrehandleRequest?: PrehandleRequestBeforeSendToServer;
        /** the request prehandle function of this controller */
        private controlPrehandleRequest?: PrehandleRequestBeforeSendToServer;
        /**
         * set the global request prehandle function.
         * This function will handle all requst before this request sent to server.
         * @param prehandleRequest -- request prehandle function
         */
        static SetGlobalRequestPrehandleFunction(prehandleRequest?: PrehandleRequestBeforeSendToServer): void {
            HongboRootControl.GlobalPrehandleRequest = prehandleRequest;
        }
        /** set the request prehandle function of this controller instance.
         *  if set, this function will all request of every action of ths controller before the request sent to server
         *  @param prehandleRequest -- request prehandle function
         *  @param prehandleOption -- request prehandle option
         */
        setRequestPrehandleFunction(prehandleRequest?: PrehandleRequestBeforeSendToServer,
            prehandleOption: EnumPreHandleOption = EnumPreHandleOption.afterGlobal
        ): void {
            if (!prehandleRequest) {
                this.controlPrehandleRequest = undefined;
                return;
            }
            switch (prehandleOption) {
                case EnumPreHandleOption.replaceGlobalForEver:
                    this.controlPrehandleRequest = (url, content, request) => {
                        if (prehandleRequest) {
                            request = prehandleRequest(url, content, request);
                        }
                        return request;
                    };
                    break;
                case EnumPreHandleOption.replaceGlobalTemp:
                    this.controlPrehandleRequest = (url, content, request) => {
                        if (prehandleRequest) {
                            request = prehandleRequest(url, content, request);
                            this.controlPrehandleRequest = undefined;
                        }
                        return request;
                    };
                    break;
                case EnumPreHandleOption.beforeGlobal:
                    this.controlPrehandleRequest = (url, content, request) => {
                        if (prehandleRequest) {
                            request = prehandleRequest(url, content, request);
                        }
                        if (HongboRootControl.GlobalPrehandleRequest) {
                            request = prehandleRequest(url, content, request);
                        }
                        return request;
                    };
                    break;
                case EnumPreHandleOption.afterGlobal:
                        this.controlPrehandleRequest = (url, content, request) => {
                            if (HongboRootControl.GlobalPrehandleRequest) {
                                request = prehandleRequest(url, content, request);
                            }
                            if (prehandleRequest) {
                                request = prehandleRequest(url, content, request);
                            }
                            return request;
                        };
                        break;
            }
        }

        /** Global response prehandle fuction, will handle every response from server. */
        private static GlobalResponsePrehandleFunction?: PrehandleResponseAfterServerReturn;
        /** response prehandle fuction of this controller,
         * will handle every response after the action of this controller receive data from server.
         */
        private controlResponsePrehandleFunction?: PrehandleResponseAfterServerReturn;

        /** prehandle every the response after receive data from server,
         *  if set, it will handle all the response from server.
         *  @param globalResponsePrehandleFunction -- global response prehandle fuction
         */
        static SetGlobalResponsePrehandleFunction(globalResponsePrehandleFunction?: PrehandleResponseAfterServerReturn): void {
            HongboRootControl.GlobalResponsePrehandleFunction = globalResponsePrehandleFunction;
        }
        /** set the response prehandle function of this controller instance.
         *  if set, this function will handle all response after every action of ths controller receive response from server
         *  @param prehandleResponse -- request prehandle function
         *  @param prehandleOption -- request prehandle option
         */
        setResponsePrehandleFunction(prehandleResponse?: PrehandleResponseAfterServerReturn,
            prehandleOption: EnumPreHandleOption = EnumPreHandleOption.afterGlobal
        ): void {
            if (!prehandleResponse) {
                this.controlResponsePrehandleFunction = undefined;
                return;
            }
            switch (prehandleOption) {
                case EnumPreHandleOption.replaceGlobalForEver:
                    this.controlResponsePrehandleFunction = (url, content, promiseDataFunction) => {
                        if (prehandleResponse) {
                            promiseDataFunction = prehandleResponse(url, content, promiseDataFunction);
                        }
                        return promiseDataFunction;
                    };
                    break;
                case EnumPreHandleOption.replaceGlobalTemp:
                    this.controlResponsePrehandleFunction = (url, content, promiseDataFunction) => {
                        if (prehandleResponse) {
                            promiseDataFunction = prehandleResponse(url, content, promiseDataFunction);
                            this.controlResponsePrehandleFunction = undefined;
                        }
                        return promiseDataFunction;
                    };
                    break;
                case EnumPreHandleOption.beforeGlobal:
                    this.controlResponsePrehandleFunction = (url, content, promiseDataFunction) => {
                        if (prehandleResponse) {
                            promiseDataFunction = prehandleResponse(url, content, promiseDataFunction);
                        }
                        if (HongboRootControl.GlobalResponsePrehandleFunction) {
                            promiseDataFunction = HongboRootControl.GlobalResponsePrehandleFunction(url, content, promiseDataFunction);
                        }
                        return promiseDataFunction;
                    };
                    break;
                case EnumPreHandleOption.afterGlobal:
                        this.controlResponsePrehandleFunction = (url, content, promiseDataFunction) => {
                            if (HongboRootControl.GlobalResponsePrehandleFunction) {
                                promiseDataFunction = HongboRootControl.GlobalResponsePrehandleFunction(url, content, promiseDataFunction);
                            }
                            if (prehandleResponse) {
                                promiseDataFunction = prehandleResponse(url, content, promiseDataFunction);
                            }
                            return promiseDataFunction;
                        };
                        break;
            }
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
                if (this.controlPrehandleRequest) {
                    return this.controlPrehandleRequest(url, content, request);
                } else if (HongboRootControl.GlobalPrehandleRequest) {
                    return HongboRootControl.GlobalPrehandleRequest(url, content, request);
                }
                return request;
            };
            let content: IMethodBodyHeader = Lll1lll1l1l111l1l111l1.l11ll1lll111l1l11l11l(this.controlOption, actionDefine);
            try {
                 let result: Promise<any> = HongboRootControl.sendRequestToServer(url, content, prehandleRequest);
                 if (this.controlResponsePrehandleFunction) {
                    return this.controlResponsePrehandleFunction(url, content, result);
                 } else if (HongboRootControl.GlobalResponsePrehandleFunction) {
                    return HongboRootControl.GlobalResponsePrehandleFunction(url, content, result);
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

    export class Lll1lll1l1l111l1l111l1 {
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
export namespace TsGenCoreExample.Controllers {
    // tslint:disable-next-line:class-name
    export class AbstractGenericController_2<TDbContext,TModel> extends Hongbo.HongboRootControl {

        /** define the constructor of AbstractGenericController`2 */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractGenericController`2",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.NetCore,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:class-name
    export class AbstractGenericController_1<TDbContext> extends Hongbo.HongboRootControl {

        /** define the constructor of AbstractGenericController`1 */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "AbstractGenericController`1",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.NetCore,
                routeDefine: {}
            };
        }
    }
    // tslint:disable-next-line:class-name
    export class HomeController extends AbstractGenericController_1<object> {

        /** define the constructor of HomeController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "HomeController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.NetCore,
                routeDefine: {"RouteContent":"Home"}
            };
        }
        /** TsGenCoreExample.Controllers.HomeController.DeleteMethod
         *   @param id id
         */
        DeleteMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpDelete":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.GenericValueType */
        // tslint:disable-next-line:max-line-length
        GenericValueType(): Promise<Entitys.System.Tuple_2<Entitys.Hongbo.Basic.Systems.CheckResult,Array<Entitys.TsGenCoreExample.Models.Person>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.GetCheckResult */
        GetCheckResult(): Promise<Entitys.Hongbo.Basic.Systems.CheckResult> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.GetEntityWithType */
        GetEntityWithType(): Promise<Entitys.Null_Or_EntityWithTypeInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.GetInfoFromForm
         *   @param id id
         */
        GetInfoFromForm(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.GetInfoFromHead
         *   @param id id
         */
        GetInfoFromHead(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromHeader":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.GetInfoFromQuery
         *   @param id id
         */
        GetInfoFromQuery(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromQuery":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.GetMethod
         *   @param id id
         */
        GetMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromQuery":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.HeadMethod
         *   @param id id
         */
        HeadMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpHead":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromHeader":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.ListPerson */
        // tslint:disable-next-line:max-line-length
        ListPerson(): Promise<Entitys.Null_Or_GenericJsonResponsesInTsGenCoreExampleModels<Array<Entitys.TsGenCoreExample.Models.Person>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.OptionsMethod
         *   @param id id
         */
        OptionsMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpOptions":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.PatchMethod
         *   @param id id
         */
        PatchMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPatch":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.PostFromBody
         *   @param cat cat
         */
        PostFromBody(cat: Entitys.Null_Or_CatInTsGenCoreExampleModels): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"cat"}];
            actionInfo.inParameterDefines[0].value = cat;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.PostMethod
         *   @param cat cat
         */
        PostMethod(cat: Entitys.Null_Or_CatInTsGenCoreExampleModels): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"cat"}];
            actionInfo.inParameterDefines[0].value = cat;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.PutMethod
         *   @param id id
         */
        PutMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPut":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.TestGenericWorkFlow */
        // tslint:disable-next-line:max-line-length
        TestGenericWorkFlow(): Promise<Entitys.Null_Or_GenericWorkFlowInTsGenCoreExampleModels<Entitys.TsGenCoreExample.Models.Dog,Entitys.TsGenCoreExample.Models.EnumAnimalType>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.HomeController.ViewModel
         *   @param bodyPar bodyPar
         *   @param headerPar headerPar
         *   @param queryPar queryPar
         *   @param routePar routePar
         *   @param formPar formPar
         */
        // tslint:disable-next-line:max-line-length
        ViewModel(bodyPar: Entitys.Null_Or_String,headerPar: number,queryPar: number,routePar: number,formPar: number): Promise<Entitys.Null_Or_ErrorViewModelInTsGenCoreExampleModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"ViewModel","ActionNameContent":"Test"};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"bodyPar"},{"fromDefine":{"IsFromHeader":true},"name":"headerPar"},{"fromDefine":{"IsFromQuery":true},"name":"queryPar"},{"fromDefine":{"IsFromRoute":true},"name":"routePar"},{"fromDefine":{"IsFromForm":true},"name":"formPar"}];
            actionInfo.inParameterDefines[0].value = bodyPar;
            actionInfo.inParameterDefines[1].value = headerPar;
            actionInfo.inParameterDefines[2].value = queryPar;
            actionInfo.inParameterDefines[3].value = routePar;
            actionInfo.inParameterDefines[4].value = formPar;
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class TestActionController extends AbstractGenericController_2<object,Entitys.Null_Or_ErrorViewModelInTsGenCoreExampleModels> {

        /** define the constructor of TestActionController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "TestActionController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.NetCore,
                routeDefine: {}
            };
        }
        /** TsGenCoreExample.Controllers.TestActionController.Index */
        Index(): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.TestActionController.IndexWithRoute */
        IndexWithRoute(): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"iwr"};
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
                environment: Hongbo.EnumEnvironment.NetCore,
                routeDefine: {"RouteContent":"tr"}
            };
        }
        /** TsGenCoreExample.Controllers.TestRouteController.Index */
        Index(): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.TestRouteController.IndexWithRoute */
        IndexWithRoute(): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"iwr"};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.TestRouteController.RootIndexWithRoute */
        RootIndexWithRoute(): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"/riwr"};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
    }
    // tslint:disable-next-line:class-name
    export class Values1Controller extends Hongbo.HongboRootControl {

        /** define the constructor of Values1Controller */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "Values1Controller",
                controlMode: Hongbo.EnumControlMode.WebApi,
                environment: Hongbo.EnumEnvironment.NetCore,
                routeDefine: {"RouteContent":"api/[controller]"}
            };
        }
        /** TsGenCoreExample.Controllers.Values1Controller.Get */
        Get(): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.Values1Controller.ListCat */
        ListCat(): Promise<Array<Entitys.TsGenCoreExample.Models.Cat>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
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
                environment: Hongbo.EnumEnvironment.NetCore,
                routeDefine: {"RouteContent":"api/[controller]"}
            };
        }
        /** TsGenCoreExample.Controllers.ValuesController.DeleteMethod
         *   @param id id
         */
        DeleteMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpDelete":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.ValuesController.GetMethod
         *   @param id id
         */
        GetMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromQuery":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.ValuesController.HeadMethod
         *   @param id id
         */
        HeadMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpHead":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromHeader":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.ValuesController.ListCat */
        ListCat(): Promise<Array<Entitys.TsGenCoreExample.Models.Cat>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"api/Get"};
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.ValuesController.ListCat1 */
        ListCat1(): Promise<Array<Entitys.TsGenCoreExample.Models.Cat>> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"/api/Get1"};
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.ValuesController.OptionsMethod
         *   @param id id
         */
        OptionsMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpOptions":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.ValuesController.PatchMethod
         *   @param id id
         */
        PatchMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPatch":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.ValuesController.PostMethod
         *   @param cat cat
         */
        PostMethod(cat: Entitys.Null_Or_CatInTsGenCoreExampleModels): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"cat"}];
            actionInfo.inParameterDefines[0].value = cat;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.Controllers.ValuesController.PutMethod
         *   @param id id
         */
        PutMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPut":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
    }
    /** define a static instance of HomeController */
    export const HomeInstance: HomeController = new HomeController();

    /** define a static instance of TestActionController */
    // tslint:disable-next-line:max-line-length
    export const TestActionInstance: TestActionController = new TestActionController();

    /** define a static instance of TestRouteController */
    // tslint:disable-next-line:max-line-length
    export const TestRouteInstance: TestRouteController = new TestRouteController();

    /** define a static instance of Values1Controller */
    export const Values1Instance: Values1Controller = new Values1Controller();

    /** define a static instance of ValuesController */
    export const ValuesInstance: ValuesController = new ValuesController();

}
export namespace TsGenCoreExample.ChildControllers {
    // tslint:disable-next-line:max-line-length & class-name
    export class DifferentNamespaceController extends TsGenCoreExample.Controllers.AbstractGenericController_2<object,Entitys.Null_Or_PersonInTsGenCoreExampleModels> {

        /** define the constructor of DifferentNamespaceController */
        constructor() {
            super();
            this.controlOption= {
                controlTypeName: "DifferentNamespaceController",
                controlMode: Hongbo.EnumControlMode.Mvc,
                environment: Hongbo.EnumEnvironment.NetCore,
                routeDefine: {}
            };
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.DeleteMethod
         *   @param id id
         */
        DeleteMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpDelete":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.GenericValueType */
        // tslint:disable-next-line:max-line-length
        GenericValueType(): Promise<Entitys.System.Tuple_2<Entitys.Hongbo.Basic.Systems.CheckResult,Array<Entitys.TsGenCoreExample.Models.Person>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.GetCheckResult */
        GetCheckResult(): Promise<Entitys.Hongbo.Basic.Systems.CheckResult> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.GetEntityWithType */
        GetEntityWithType(): Promise<Entitys.Null_Or_EntityWithTypeInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.GetInfoFromForm
         *   @param id id
         */
        GetInfoFromForm(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.GetInfoFromHead
         *   @param id id
         */
        GetInfoFromHead(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromHeader":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.GetInfoFromQuery
         *   @param id id
         */
        GetInfoFromQuery(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromQuery":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.GetMethod
         *   @param id id
         */
        GetMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpGet":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromQuery":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.HeadMethod
         *   @param id id
         */
        HeadMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpHead":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromHeader":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.ListPerson */
        // tslint:disable-next-line:max-line-length
        ListPerson(): Promise<Entitys.Null_Or_GenericJsonResponsesInTsGenCoreExampleModels<Array<Entitys.TsGenCoreExample.Models.Person>>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.OptionsMethod
         *   @param id id
         */
        OptionsMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpOptions":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.PatchMethod
         *   @param id id
         */
        PatchMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPatch":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.PostFromBody
         *   @param cat cat
         */
        PostFromBody(cat: Entitys.Null_Or_CatInTsGenCoreExampleModels): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"cat"}];
            actionInfo.inParameterDefines[0].value = cat;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.PostMethod
         *   @param cat cat
         */
        PostMethod(cat: Entitys.Null_Or_CatInTsGenCoreExampleModels): Promise<Entitys.Null_Or_String> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPost":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"cat"}];
            actionInfo.inParameterDefines[0].value = cat;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.PutMethod
         *   @param id id
         */
        PutMethod(id: number): Promise<Entitys.Null_Or_CatInTsGenCoreExampleModels> {
            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.httpMethod = {"IsHttpPut":true};
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromForm":true},"name":"id"}];
            actionInfo.inParameterDefines[0].value = id;
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.TestGenericWorkFl */
        // tslint:disable-next-line:max-line-length
        TestGenericWorkFlow(): Promise<Entitys.Null_Or_GenericWorkFlowInTsGenCoreExampleModels<Entitys.TsGenCoreExample.Models.Dog,Entitys.TsGenCoreExample.Models.EnumAnimalType>> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.inParameterDefines = [];
            return this.callAction(actionInfo);
        }
        /** TsGenCoreExample.ChildControllers.DifferentNamespaceController.ViewModel
         *   @param bodyPar bodyPar
         *   @param headerPar headerPar
         *   @param queryPar queryPar
         *   @param routePar routePar
         *   @param formPar formPar
         */
        // tslint:disable-next-line:max-line-length
        ViewModel(bodyPar: Entitys.Null_Or_String,headerPar: number,queryPar: number,routePar: number,formPar: number): Promise<Entitys.Null_Or_ErrorViewModelInTsGenCoreExampleModels> {

            let actionInfo: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
            actionInfo.routeDefine = {"RouteContent":"ViewModel","ActionNameContent":"Test"};
            // tslint:disable-next-line:max-line-length
            actionInfo.inParameterDefines = [{"fromDefine":{"IsFromBody":true},"name":"bodyPar"},{"fromDefine":{"IsFromHeader":true},"name":"headerPar"},{"fromDefine":{"IsFromQuery":true},"name":"queryPar"},{"fromDefine":{"IsFromRoute":true},"name":"routePar"},{"fromDefine":{"IsFromForm":true},"name":"formPar"}];
            actionInfo.inParameterDefines[0].value = bodyPar;
            actionInfo.inParameterDefines[1].value = headerPar;
            actionInfo.inParameterDefines[2].value = queryPar;
            actionInfo.inParameterDefines[3].value = routePar;
            actionInfo.inParameterDefines[4].value = formPar;
            return this.callAction(actionInfo);
        }
    }
    /** define a static instance of DifferentNamespaceController */
    // tslint:disable-next-line:max-line-length
    export const DifferentNamespaceInstance: DifferentNamespaceController = new DifferentNamespaceController();

}
