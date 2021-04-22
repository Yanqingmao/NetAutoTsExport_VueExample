import { Hongbo } from "../src/auto_libs/RootControlInterfaces";
import { expect, test, beforeEach } from "@jest/globals";
let paramArray: Hongbo.IActionParameterDefine[] = [];
const aspnetControlDefine: Hongbo.HongboRootControl = new Hongbo.HongboRootControl();
const actionDefine: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
beforeEach(() => {
    paramArray = [{
        name: "x",
        value: 20
    }, {
        name: "id",
        value: 123
    }];
    aspnetControlDefine.controlTypeName = "ValuesController";
    aspnetControlDefine.environment = Hongbo.EnumEnvironment.AspNet;
    aspnetControlDefine.controlMode = Hongbo.EnumControlMode.WebApi;

    actionDefine.name = "Get";
    actionDefine.inParameterDefines = paramArray;
}, 0);

test("RouteUtil.calculateWebApiUrl.Aspnet_WebApi_控制器_无任何路由定义_未指定参数", ()=> {
    paramArray[1].name = "xid";
    let result: string = Hongbo.RouteUtil.calculateWebApiUrl(aspnetControlDefine, actionDefine);
    expect(result).toBe("api/Values");
});

test("RouteUtil.calculateWebApiUrl.Aspnet_WebApi_控制器_无任何路由定义_指定参数", ()=> {
    let result: string = Hongbo.RouteUtil.calculateWebApiUrl(aspnetControlDefine, actionDefine);
    expect(result).toBe("api/Values/123");
});
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

