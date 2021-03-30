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
    aspnetControlDefine.controlMode = Hongbo.EnumControlMode.Mvc;

    actionDefine.name = "List";
    actionDefine.inParameterDefines = paramArray;
}, 0);

test("RouteUtil.calculateMvcUrl.Aspnet_Mvc_控制器_RouteArea_RoutePrefix_Route_指定参数", ()=> {
    aspnetControlDefine.environment = Hongbo.EnumEnvironment.AspNet;
    aspnetControlDefine.controlMode = Hongbo.EnumControlMode.Mvc;
    let result: Hongbo.IMethodBodyHeader = Hongbo.ContentUtil.calculateMethodBodyHead(aspnetControlDefine, actionDefine);
    expect(result.method).toBe("get");
});

