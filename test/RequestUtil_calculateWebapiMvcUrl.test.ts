import { HongboTest } from "../src/auto/RouteUtil";
import { Hongbo } from "../src/auto/RootControlInterfaces";
import { expect, test, beforeEach } from "@jest/globals";
const paramArray: Hongbo.IActionParameterDefine[] = [{
    name: "x",
    value: 20
}, {
    name: "id",
    value: 123
}];
const aspnetControlDefine: Hongbo.HongboRootContol = new Hongbo.HongboRootContol();
const actionDefine: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
beforeEach(() => {
    aspnetControlDefine.controlTypeName = "ValuesController";
    aspnetControlDefine.environment = Hongbo.EnumEnvironment.AspNet;
    aspnetControlDefine.controlType = Hongbo.EnumControlType.WebApi;

    actionDefine.name = "Get";
    actionDefine.inParameterDefines = paramArray;
}, 0);

test("RouteUtil.calculateWebApiUrl.Aspnet_WebApi_控制器_RouteArea_RoutePrefix_Route_指定参数", ()=> {
    aspnetControlDefine.environment = Hongbo.EnumEnvironment.AspNet;
    aspnetControlDefine.routeDefine = {
        RoutePrefixDefine: "tp",
        RouteContent: "{controller}/{action}/{id}"
    };
    let result: string = Hongbo.RouteUtil.calculateWebApiUrl(aspnetControlDefine, actionDefine);
    expect(result).toBe("tp/Values/Get/123");
});

test("RouteUtil.calculateWebApiUrl.Aspnet_WebApi_控制器_RouteArea_RoutePrefix_Action指定Route_指定参数", ()=> {
    aspnetControlDefine.environment = Hongbo.EnumEnvironment.AspNet;
    aspnetControlDefine.routeDefine = {
        RoutePrefixDefine: "tp",
        RouteContent: "{controller}/{action}/{id}"
    };
    actionDefine.routeDefine = {
        RouteContent: "liu/{id}"
    };
    let result: string = Hongbo.RouteUtil.calculateWebApiUrl(aspnetControlDefine, actionDefine);
    expect(result).toBe("tp/liu/123");
});


test("RouteUtil.calculateWebApiUrl.NetCore_WebApi_控制器_Control指定Route_Action指定Route_指定参数", ()=> {
    aspnetControlDefine.environment = Hongbo.EnumEnvironment.NetCore;
    aspnetControlDefine.routeDefine = {
        RouteContent: "{controller}/{action}/{x}"
    };
    actionDefine.routeDefine = {
        RouteContent: "liu/{id}"
    };
    let result: string = Hongbo.RouteUtil.calculateWebApiUrl(aspnetControlDefine, actionDefine);
    expect(result).toBe("Values/Get/20/liu/123");
});


test("RouteUtil.calculateWebApiUrl.NetCore_WebApi_控制器_Control指定Route_Action指定根Route_指定参数", ()=> {
    aspnetControlDefine.environment = Hongbo.EnumEnvironment.NetCore;
    aspnetControlDefine.routeDefine = {
        RouteContent: "{controller}/{action}/{x}"
    };
    actionDefine.routeDefine = {
        RouteContent: "/liu/{id}"
    };
    let result: string = Hongbo.RouteUtil.calculateWebApiUrl(aspnetControlDefine, actionDefine);
    expect(result).toBe("/liu/123");
});

