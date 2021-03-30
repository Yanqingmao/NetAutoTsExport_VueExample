import { Hongbo } from "../src/auto/RootControlInterfaces";
import { expect, test, beforeEach } from "@jest/globals";
import linq from "linq";
let paramArray: Hongbo.IActionParameterDefine[] = [];
const controlDefine: Hongbo.HongboRootContol = new Hongbo.HongboRootContol();
const actionDefine: Hongbo.HongboRootAction = new Hongbo.HongboRootAction();
let url: string = "";
let content: Hongbo.IMethodBodyHeader;

test("ongbo.HongboRootContol.requestWithFetch.Get", () => {
    url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/1234";
    content = { method: "get", headers: { "accept": "application/json" }};
    Hongbo.HongboRootContol.requestWithFetch(url, content).then((x) => {
        console.log(JSON.stringify(x));
    });
});


