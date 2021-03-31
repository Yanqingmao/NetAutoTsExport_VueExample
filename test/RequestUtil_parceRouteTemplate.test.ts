import { Hongbo } from "../src/auto/RootControlInterfaces";
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

    actionDefine.name = "Values";
    actionDefine.inParameterDefines = paramArray;
}, 0);

test("RouteUtil.parceRouteTemplate.无参数Route模板", ()=> {
    const route: string = "/abc/value";
    let result: string = Hongbo.RouteUtil.parceRouteTemplate(route, controlDefine, actionDefine);
    expect(result).toBe(route);
});


test("RouteUtil.parceRouteTemplate.可选默认值参数Route_无指定参数", ()=> {
    const segmentPath1: string = "/abc/{xyz?:long=10}";
    let result: string = Hongbo.RouteUtil.parceRouteTemplate(segmentPath1, controlDefine, actionDefine);
    expect(result).toBe("/abc/10");
});


test("RouteUtil.parceRouteTemplate.可选默认值参数Route_指定参数", ()=> {
    const segmentPath1: string = "/abc/{x?:long=10}";
    let result: string = Hongbo.RouteUtil.parceRouteTemplate(segmentPath1, controlDefine, actionDefine);
    expect(result).toBe("/abc/20");
});

test("RouteUtil.parceRouteTemplate.可选默认值参数Route_未指定参数", ()=> {
    const segmentPath1: string = "/abc/{y?}";
    let result: string = Hongbo.RouteUtil.parceRouteTemplate(segmentPath1, controlDefine, actionDefine);
    expect(result).toBe("/abc");
});


