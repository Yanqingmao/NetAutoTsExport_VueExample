import { Hongbo } from "../src/auto/RootControlInterfaces";
import { expect, test, beforeEach } from "@jest/globals";
import linq from "linq";
let paramArray: Hongbo.IActionParameterDefine[] = [];
const controlDefine: Hongbo.HongboRootContol = new Hongbo.HongboRootContol();
const actionDefine: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
let url: string = "";
beforeEach(() => {
    Hongbo.DebugUtil.enableDebug = false;
    paramArray = [{
        name: "x",
        value: 20,
    }, {
        name: "token",
        value: "xyz.123",
        fromDefine: { IsFromHeader: true }
    }, {
        name: "id",
        value: 123
    }];
    controlDefine.controlTypeName = "ValuesController";
    controlDefine.environment = Hongbo.EnumEnvironment.AspNet;
    controlDefine.controlMode = Hongbo.EnumControlMode.Mvc;

    actionDefine.name = "List";
    actionDefine.inParameterDefines = paramArray;

}, 0);

function loop(body: FormData): void {
    let content: string = "";
    for (let key of body.keys()) {
        content = key + "=" + body.get(key) + ",";
    }
    console.log("FormData的内容: {" + content + "}");
}

test("RouteUtil.calculateMvcUrl.calculateMethodBodyHead_什么都不指定", () => {
    url = Hongbo.RouteUtil.calculateMvcUrl(controlDefine, actionDefine);
    // tslint:disable-next-line:comment-format
    // Hongbo.DebugUtil.enableDebug = true;
    // tslint:disable-next-line:comment-format
    Hongbo.DebugUtil.info("计算出来的路由:" + url);
    let result: Hongbo.IMethodBodyHeader = Hongbo.ContentUtil.calculateMethodBodyHead(controlDefine, actionDefine);
    let leftParams: Hongbo.IActionParameterDefine[] = paramArray.filter((x) => !x.filledToRoute && !x.filledToQuery
        && !x.filledToHead && (x.value !== undefined));
    expect(leftParams.length).toBe(0); // 所有参数都已经填充到路由、Query、Header中
    expect(result.method).toBe("get");
    expect(result.body).toBeUndefined();
    let headers: Record<string, string> = result.headers;
    expect(headers.Accept).toBe("application/json");
    expect(headers["Content-Type"]).toBeUndefined();
    expect(headers.token).toBe("xyz.123");
});


test("RouteUtil.calculateMvcUrl.calculateMethodBodyHead_指定Action为Post", () => {
    actionDefine.httpMethod = { IsHttpPost: true };
    url = Hongbo.RouteUtil.calculateMvcUrl(controlDefine, actionDefine);
    // tslint:disable-next-line:comment-format
    // Hongbo.DebugUtil.enableDebug = true;
    Hongbo.DebugUtil.info("计算出来的路由:" + url);
    let result: Hongbo.IMethodBodyHeader = Hongbo.ContentUtil.calculateMethodBodyHead(controlDefine, actionDefine);
    expect(result.method).toBe("post");
    let headers: Record<string, string> = result.headers;
    expect(headers.Accept).toBe("application/json");
    expect(headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    let body: FormData = result.body as FormData;
    loop(body);
    expect(body.get("x")).toBe("20");
});


test("RouteUtil.calculateMvcUrl.calculateMethodBodyHead_指定Parameter为FromBody", () => {
    paramArray[0].fromDefine = { IsFromBody: true };
    url = Hongbo.RouteUtil.calculateMvcUrl(controlDefine, actionDefine);
    // tslint:disable-next-line:comment-format
    // Hongbo.DebugUtil.enableDebug = true;
    Hongbo.DebugUtil.info("计算出来的路由:" + url);
    let result: Hongbo.IMethodBodyHeader = Hongbo.ContentUtil.calculateMethodBodyHead(controlDefine, actionDefine);
    expect(result.method).toBe("post");
    let headers: Record<string, string> = result.headers;
    expect(headers.Accept).toBe("application/json");
    expect(headers["Content-Type"]).toBe("application/json");
    let body: string = result.body as string;
    expect(body).toBe("20");
});


test("RouteUtil.calculateMvcUrl.calculateMethodBodyHead_指定Parameter为FromForm_带有复杂对象", () => {
    console.log("--------------calculateMethodBodyHead_指定Parameter为FromForm_带有复杂对象----------------------------");
    paramArray[0].fromDefine = { IsFromForm: true };
    paramArray[0].value = { IsFromForm: true };
    // tslint:disable-next-line:comment-format
    // Hongbo.DebugUtil.enableDebug = true;
    url = Hongbo.RouteUtil.calculateMvcUrl(controlDefine, actionDefine);
    Hongbo.DebugUtil.info("计算出来的路由:" + url);
    let result: Hongbo.IMethodBodyHeader = Hongbo.ContentUtil.calculateMethodBodyHead(controlDefine, actionDefine);
    let leftParams: Hongbo.IActionParameterDefine[] = paramArray.filter((x) => !x.filledToRoute && !x.filledToQuery
                && !x.filledToHead && (x.value !== undefined));
    Hongbo.DebugUtil.info("剩余参数：", leftParams);
    expect(leftParams.length).toBe(1);
    expect(result.method).toBe("post");
    let headers: Record<string, string> = result.headers;
    expect(headers.Accept).toBe("application/json");
    expect(headers["Content-Type"]).toBe("multipart/form-data");
    let body: FormData = result.body as FormData;
    loop(body);
    expect(linq.from(body.keys()).count()).toBe(1);
    expect(body.get("x")).toBe("{\"IsFromForm\":true}");
});

