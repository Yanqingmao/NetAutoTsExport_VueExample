import { Hongbo } from "../src/auto/RootControlInterfaces";
import { expect, test, beforeEach } from "@jest/globals";
const paramArray: Hongbo.IActionParameterDefine[] = [{
    name: "x",
    value: 20
}, {
    name: "id",
    value: 123
}];
const aspnetControlDefine: Hongbo.HongboRootControl = new Hongbo.HongboRootControl();
const actionDefine: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
beforeEach(() => {
    aspnetControlDefine.controlTypeName = "ValuesController";
    aspnetControlDefine.environment = Hongbo.EnumEnvironment.AspNet;
    aspnetControlDefine.controlMode = Hongbo.EnumControlMode.Mvc;

    actionDefine.name = "Get";
    actionDefine.inParameterDefines = paramArray;
}, 0);

test("RouteUtil.calculateMvcUrl.Aspnet_Mvc_控制器_RouteArea_RoutePrefix_Route_指定参数", ()=> {
    aspnetControlDefine.environment = Hongbo.EnumEnvironment.AspNet;
    aspnetControlDefine.controlMode = Hongbo.EnumControlMode.Mvc;
    aspnetControlDefine.routeDefine = {
        RouteAreaContent: "tr/{x}",
        RoutePrefixDefine: "tp",
        RouteContent: "{controller}/{action}/{id}"
    };
    let result: string = Hongbo.RouteUtil.calculateMvcUrl(aspnetControlDefine, actionDefine);
    expect(result).toBe("tr/20/tp/Values/Get/123");
});

test("RouteUtil.calculateMvcUrl.Aspnet_Mvc_控制器_RouteArea_RoutePrefix_Action指定Route_指定参数", ()=> {
    aspnetControlDefine.environment = Hongbo.EnumEnvironment.AspNet;
    aspnetControlDefine.controlMode = Hongbo.EnumControlMode.Mvc;
    aspnetControlDefine.routeDefine = {
        RouteAreaContent: "tr/{x}",
        RoutePrefixDefine: "tp",
        RouteContent: "{controller}/{action}/{id}"
    };
    actionDefine.routeDefine = {
        RouteContent: "liu/{id}"
    };
    let result: string = Hongbo.RouteUtil.calculateMvcUrl(aspnetControlDefine, actionDefine);
    expect(result).toBe("tr/20/tp/liu/123");
});


test("RouteUtil.calculateMvcUrl.NetCore_Mvc_控制器_Control指定Route_Action指定Route_指定参数", ()=> {
    aspnetControlDefine.environment = Hongbo.EnumEnvironment.NetCore;
    aspnetControlDefine.controlMode = Hongbo.EnumControlMode.Mvc;
    aspnetControlDefine.routeDefine = {
        RouteContent: "{controller}/{action}/{x}"
    };
    actionDefine.routeDefine = {
        RouteContent: "liu/{id}"
    };
    let result: string = Hongbo.RouteUtil.calculateMvcUrl(aspnetControlDefine, actionDefine);
    expect(result).toBe("Values/Get/20/liu/123");
});


test("RouteUtil.calculateMvcUrl.NetCore_Mvc_控制器_Control指定Route_Action指定根Route_指定参数", ()=> {
    aspnetControlDefine.environment = Hongbo.EnumEnvironment.NetCore;
    aspnetControlDefine.controlMode = Hongbo.EnumControlMode.Mvc;
    aspnetControlDefine.routeDefine = {
        RouteContent: "{controller}/{action}/{x}"
    };
    actionDefine.routeDefine = {
        RouteContent: "/liu/{id}"
    };
    let result: string = Hongbo.RouteUtil.calculateMvcUrl(aspnetControlDefine, actionDefine);
    expect(result).toBe("/liu/123");
});
