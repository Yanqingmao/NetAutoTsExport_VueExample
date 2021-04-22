import { Hongbo } from "../src/auto_libs/RootControlInterfaces";
import { expect, test, beforeEach } from "@jest/globals";
// import RouteUtil = Hongbo.RouteUtil;
// import RouteSegment = Hongbo.RouteSegment;
const paramArray: Hongbo.IActionParameterDefine[] = [{
    name: "x",
    value: 20
}];
const controlDefine: Hongbo.HongboRootControl = new Hongbo.HongboRootControl();
const actionDefine: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
beforeEach(() => {
    controlDefine.controlTypeName = "ValuesController";
    controlDefine.environment = Hongbo.EnumEnvironment.AspNet;
    controlDefine.controlMode = Hongbo.EnumControlMode.Mvc;

    actionDefine.name = "Get";
    actionDefine.inParameterDefines = paramArray;
}, 0);

test("RouteUtil.parceControllerRoute.无参数Route模板", ()=> {
    controlDefine.routeDefine = { RouteContent: "values/1234"};
    let result: string = Hongbo.RouteUtil.parceControllerRoute(controlDefine, actionDefine);
    expect(result).toBe("values/1234");
});

test("RouteUtil.parceControllerRoute.可选参数Route模板.未指定参数值", ()=> {
    controlDefine.routeDefine = { RouteContent: "values/{y?}"};
    let result: string = Hongbo.RouteUtil.parceControllerRoute(controlDefine, actionDefine);
    expect(result).toBe("values");
});

test("RouteUtil.parceControllerRoute.可选参数Route模板._带{Controller}_{Action}未指定参数值", ()=> {
    controlDefine.routeDefine = { RouteContent: "{controller}/{action}/values/{y?}"};
    let result: string = Hongbo.RouteUtil.parceControllerRoute(controlDefine, actionDefine);
    expect(result).toBe("Values/Get/values");
});

