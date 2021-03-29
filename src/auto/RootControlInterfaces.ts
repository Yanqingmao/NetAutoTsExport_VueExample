
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
    /** the control type enum */
    export enum EnumControlType {
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
    /** RootController define, all control should extends from this implicit or explicit */
    export class HongboRootContol {
        static DefaulMvctRoute: string = "{controller}/{action}/{id}";

        /** the type name of Controller */
        public controlTypeName: string = "";

        /** .net environment  */
        public environment: EnumEnvironment = EnumEnvironment.NetCore;

        /** the type of Controller */
        public controlType: EnumControlType = EnumControlType.WebApi;

        /** ths route defined on Controller, maybe {}  */
        public routeDefine?: IRouteDefine;

        /**
         * execute the action
         */
        callAction(actionDefine: HongboRootAction): Promise<any> {
            /*let params = actionDefine.inParameterDefines;
            let url = "";
            if (this.controlType === EnumControlType.Mvc) {
                this.callAspNetMvcAction(actionDefine);
            }*/
            return {} as any;
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
        private static XDebug(...msgs: any[]): void {
            msgs.forEach(element => {
                console.log(element);
            });
        }
        /**
         * 在 WebApi模式中, 根据路由和给定的参数计算发送请求的 Url
         */
        static calculateWebApiUrl(controlDefine: HongboRootContol, actionDefine: HongboRootAction): string {
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
                url = RouteUtil.parceRouteTemplate(HongboRootContol.DefaulMvctRoute, controlDefine, actionDefine);
            }
            return url;
        }

        /**
         * 在 MVC模式中, 根据路由和给定的参数计算发送请求的 Url
         */
        static calculateMvcUrl(controlDefine: HongboRootContol, actionDefine: HongboRootAction): string {
            let url: string = "";

            // asp.net ， the route defined on action will replace the route on control
            if (controlDefine.environment === EnumEnvironment.AspNet) {
                // route area defined on Controller , only in asp.net mvc
                url += RouteUtil.parceRouteArea(controlDefine, actionDefine);
                RouteUtil.XDebug("parceRouteArea", url);
                // route prefix defined on Controller , only in asp.net mvc or asp.net webapi
                url += RouteUtil.parceRoutePrefix(controlDefine, actionDefine);
                RouteUtil.XDebug("parceRoutePrefix", url);

                let actionRoute: string = RouteUtil.parceActionRoute(controlDefine, actionDefine);
                RouteUtil.XDebug("parceActionRoute", actionRoute);
                if (actionRoute) {
                    url += actionRoute;
                    console.log(url);
                } else {
                    const controlRoute: string = RouteUtil.parceControllerRoute(controlDefine, actionDefine);
                    RouteUtil.XDebug("parceControllerRoute", controlRoute);
                    url += controlRoute;
                    console.log(url);
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
                url += RouteUtil.parceRouteTemplate(HongboRootContol.DefaulMvctRoute, controlDefine, actionDefine);
            }
            let queryPar: string = RouteUtil.combineFromQueryParameter(controlDefine, actionDefine);
            if (queryPar) { url = url + "?" + queryPar; }
            return url;
        }

        /** 明确指定了 fromQuery 的参数, 产生 queryString */
        private static combineFromQueryParameter(controlDefine: HongboRootContol, actionDefine: HongboRootAction): string {
            if (actionDefine.inParameterDefines) {
                let method: IHttpMethodDefine | undefined = actionDefine.httpMethod;
                let httpGet: boolean = true;
                if (!method || method.IsHttpGet) { httpGet = true; }
                let params: IActionParameterDefine[] = actionDefine.inParameterDefines.filter((x) => {
                    if (x.filledToRoute === true) {
                        return false;// 已经填充到路由，不再填充到 query
                    }
                    if ((httpGet && x.fromDefine) || (x.fromDefine && x.fromDefine.IsFromQuery)) { return true; }
                    if (x.value !== undefined) { return true; }
                    return false;
                });
                return params.map((x) => encodeURIComponent(x.name) + "=" + encodeURIComponent(x.value)).join("&");
            }
            return "";
        }
        /** 解析 routeArea 路由 并利用给定参数填充 */
        private static parceRouteArea(controlDefine: HongboRootContol, actionDefine: HongboRootAction): string {
            if (controlDefine.routeDefine && controlDefine.routeDefine.RouteAreaContent) {
                return RouteUtil.parceRouteTemplate(controlDefine.routeDefine.RouteAreaContent, controlDefine, actionDefine) + "/";
            }
            return "";
        }
        /** 解析 routePrefix 路由定义 */
        private static parceRoutePrefix(controlDefine: HongboRootContol, actionDefine: HongboRootAction): string {
            if (controlDefine && controlDefine.routeDefine && controlDefine.routeDefine.RoutePrefixDefine) { //
                return `${controlDefine.routeDefine.RoutePrefixDefine}` + "/";
            }
            return "";
        }

        /** 解析 action 上的 route 路由定义 */
        private static parceActionRoute(controlDefine: HongboRootContol, actionDefine: HongboRootAction): string {
            if (actionDefine.routeDefine && actionDefine.routeDefine.RouteContent) {
                return RouteUtil.parceRouteTemplate(actionDefine.routeDefine.RouteContent, controlDefine, actionDefine);
            }
            return "";
        }

        /** 解析 controller 上的 route 路由定义 */
        static parceControllerRoute(controlDefine: HongboRootContol, actionDefine: HongboRootAction): string {
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
        public static parceRouteTemplate(template: string, control: HongboRootContol, actionDefine: HongboRootAction): string {
            let paramArray: IActionParameterDefine[] = actionDefine.inParameterDefines;
            const original: string = template;
            // replace the {controller} withc type of Control
            template = template.replace("{controller}", control.controlTypeName.replace("Controller", ""));
            RouteUtil.XDebug(original, "after replace controller", template);
            // replace {action} with actionName or name of action.
            template = template.replace("{action}", actionDefine.actionName ? actionDefine.actionName : actionDefine.name);
            RouteUtil.XDebug(original, "after replace action", template);
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
            // console.log(validSegments);
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