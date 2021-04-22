import { Hongbo } from "../src/auto_libs/RootControlInterfaces";
import { expect, test, beforeEach } from "@jest/globals";
import linq from "linq";
let paramArray: Hongbo.IActionParameterDefine[] = [];
const controlDefine: Hongbo.HongboRootControl = new Hongbo.HongboRootControl();
const actionDefine: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
let url: string = "";
let content: Hongbo.IMethodBodyHeader;

test("ongbo.HongboRootControl.requestWithFetch.Get", () => {
    url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/1234";
    content = { method: "get", headers: { "accept": "application/json" }};
    Hongbo.HongboRootControl.requestWithFetch(url, content, null).then((x) => {
        console.log(JSON.stringify(x));
    });
});


