<template>
  <view class="content">
    <view class="title">
      Test the controller in autoTs/control.ts (using the Axios library)
    </view>
    <view>
      <input v-model="token" placeholder="token in http headers">
    </view>
    <view style="div: flex; flex-wrap: wrap; flex-direction: row">
      <button @click="valuesGetNoId">
        Values Get Method( No Id In Route )
      </button>
      <button @click="valuesGetWithId">
        Values Get Method( Assitn Id In Route )
      </button>
    </view>
    <view style="div: flex; flex-wrap: wrap; flex-direction: row">
      <button @click="valuePostFromBody">Value Post (From Body)</button>
      <button @click="valuePostFromBodyAndResponsePrehandleGlobal">
        Value Post (From Body) And Global Handle Response
      </button>
    </view>
    <h6>Request Url</h6>
    <view style="div: flex; flex-wrap: wrap">{{ requestUrl }}</view>
    <h6>Request Content</h6>
    <view>
      <textarea class="text-area" v-model="jsonedRequestContent"> </textarea>
    </view>

    <h6>Response</h6>
    <view>
      <textarea class="text-area" v-model="jsonedResponse"> </textarea>
    </view>
  </view>
</template>

<script lang="ts">
import * as Root from "@/autoTs/control";
import * as Entitys from "@/autoTs/entity";
import { AxiosRequestConfig } from "axios";
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      title: "Hello",
      jsonedResponse: "",
      requestUrl: "",
      jsonedRequestContent: "",
      token: "",
    };
  },
  onLoad() {},
  methods: {
    clearAndPrehandle() {
      this.requestUrl = "";
      this.jsonedResponse = "";
      this.jsonedRequestContent = "";
      Root.Hongbo.HongboRootControl.SetGlobalRequestPrehandleFunction(
        (
          url: string,
          content: Root.Hongbo.IMethodBodyHeader,
          request: AxiosRequestConfig
        ) => {
          this.requestUrl = url;
          if (this.token) {
            content.headers["token"] = this.token;
          }
          this.jsonedRequestContent = JSON.stringify(content);
          return request;
        }
      );
	  Root.Hongbo.HongboRootControl.SetGlobalResponsePrehandleFunction();
    },
    valuesGetNoId() {
      this.clearAndPrehandle();
      Root.TsGenAspnetExample.Controllers.ValuesInstance.get().then((x) => {
        this.jsonedResponse = JSON.stringify(x);
      });
    },
    valuesGetWithId() {
      this.clearAndPrehandle();
      Root.TsGenAspnetExample.Controllers.ValuesInstance.setRequestPrehandleFunction();
      Root.TsGenAspnetExample.Controllers.ValuesInstance.setResponsePrehandleFunction();
      Root.TsGenAspnetExample.Controllers.ValuesInstance.Get(1234).then((x) => {
        this.jsonedResponse = JSON.stringify(x);
      });
    },
    valuePostFromBody() {
      this.clearAndPrehandle();
      let employee: Entitys.TsGenAspnetExample.Models.Employee = new Entitys.TsGenAspnetExample.Models.Employee();
      Root.TsGenAspnetExample.Controllers.ValuesInstance.Post(employee).then(
        (x) => {
          this.jsonedResponse = JSON.stringify(x);
        }
      );
    },
    valuePostFromBodyAndResponsePrehandleGlobal() {
      this.clearAndPrehandle();
      let employee: Entitys.TsGenAspnetExample.Models.Employee = new Entitys.TsGenAspnetExample.Models.Employee();
      Root.Hongbo.HongboRootControl.SetGlobalResponsePrehandleFunction(
        (url, content, resultPromise) => {
          return resultPromise.then((data) => {
            let result: Entitys.TsGenAspnetExample.Models.Employee = data as Entitys.TsGenAspnetExample.Models.Employee;
            if (result.Age < 15) {
              // when age is lower than 15, enter the error handle.
              alert("You are too young(lower than " + result.Age+"), and will enter error handle");
              return Promise.reject(result);
            } else {
              return Promise.resolve(result);
            }
          });
        }
      );
      Root.TsGenAspnetExample.Controllers.ValuesInstance.Post(employee)
        .then((x) => {
          this.jsonedResponse = JSON.stringify(x);
        })
        .catch((rsult: any) => {
          this.jsonedResponse =
            "Server return data, but handled error in the GlobalResponsePrehandleFunction";
        });
    },
  },
});
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 6px;
  font-size: 14px;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin: 200rpx auto 50rpx auto;
}
input {
	width: 400px;
  border: solid 1px black;
}
textarea {
  width: 600px;
  height: 120px;
  border: solid 1px black;
}

button {
  margin-right: 20px;
}
.title {
  font-size: 36rpx;
  color: #8f8f94;
}
uni-button {
  display: inline !important;
}
h6 {
  color: red;
  font-size: 36rpx;
}
</style>
