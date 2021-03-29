import { HongboTest } from "../src/auto/RouteUtil";
import { Hongbo } from "../src/auto/RootControlInterfaces";
import { expect, test, beforeEach } from "@jest/globals";
const paramArray: Hongbo.IActionParameterDefine[] = [{
    name: "x",
    value: 20
}];
const controlDefine: Hongbo.HongboRootContol = new Hongbo.HongboRootContol();
const actionDefine: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
beforeEach(() => {
    controlDefine.controlTypeName = "ValuesController";
    controlDefine.environment = Hongbo.EnumEnvironment.AspNet;
    controlDefine.controlType = Hongbo.EnumControlType.Mvc;

    actionDefine.name = "Values";
    actionDefine.inParameterDefines = paramArray;
}, 0);

test("RouteUtil.parceRouteSegment.默认值路由段_未指定参数", ()=> {
    const segmentPath1: string = "{x:long=10}";
    let result: Hongbo.RouteSegment = Hongbo.RouteUtil.parceRouteSegment(segmentPath1, []);
    expect(result.name).toBe("x");
    expect(result.isOptional).toBe(false);
    expect(result.defaultValue).toBe("10");
    expect(result.assignParamInfo).toBeUndefined();

});

test("RouteUtil.parceRouteSegment.可选路由段_无默认值_指定参数", ()=> {
    const segmentPath1: string = "{x?}";
    let result: Hongbo.RouteSegment = Hongbo.RouteUtil.parceRouteSegment(segmentPath1, paramArray);
    expect(result.name).toBe("x");
    expect(result.isOptional).toBe(true);
    expect(result.defaultValue).toBeUndefined();
    expect(result.assignParamInfo).toBeDefined();
    if (result.assignParamInfo) {
        expect(result.assignParamInfo.value).toBe(20);
    }
});

test("RouteUtil.parceRouteSegment.可选路由段_无默认值", ()=> {
    const segmentPath1: string = "{x?}";
    let result: Hongbo.RouteSegment = Hongbo.RouteUtil.parceRouteSegment(segmentPath1, []);
    // console.log(result);
    expect(result.name).toBe("x");
    expect(result.isOptional).toBe(true);
    expect(result.defaultValue).toBeUndefined();
    expect(result.assignParamInfo).toBeUndefined();
});

test("RouteUtil.parceRouteSegment.可选默认值参数路由段", ()=> {
    const segmentPath1: string = "{x?:long=10}";
    let result: Hongbo.RouteSegment = Hongbo.RouteUtil.parceRouteSegment(segmentPath1, []);
    expect(result.name).toBe("x");
    expect(result.isOptional).toBe(true);
    expect(result.defaultValue).toBe("10");
    expect(result.assignParamInfo).toBe(undefined);
});

test("RouteUtil.parceRouteSegment.非参数路由段", ()=> {
    const segmentPath1: string = "xyz";
    let result: Hongbo.RouteSegment = Hongbo.RouteUtil.parceRouteSegment(segmentPath1, []);
    expect(result.name).toBe("xyz");
    expect(result.defaultValue).toBe("xyz");
    expect(result.isFixed).toBe(true);
    expect(result.assignParamInfo).toBe(undefined);
});

test("RouteUtil.parceRouteSegment.可选默认值参数路由段_指定参数", ()=> {
    const segmentPath1: string = "{x?:long=10}";
    let result: Hongbo.RouteSegment = Hongbo.RouteUtil.parceRouteSegment(segmentPath1, paramArray);
    expect(result.name).toBe("x");
    expect(result.isOptional).toBe(true);
    expect(result.defaultValue).toBe("10");
    expect(result.defaultValue).toBeDefined();
    if (result.assignParamInfo) {
        expect(result.assignParamInfo.value).toBe(20);
    }
});


