<template>
	<view class="content">	
		<view>
			<h5>测试 RootControlInterfaces 中的所有 Web库的使用方法 </h5>
		</view>
		<view style='div:flex; flex-wrap:wrap; flex-direction: row;'>
            <button @click='jumpToControleExample'>Jump To Control Example</button>
		</view>
		<view style='div:flex; flex-wrap:wrap; flex-direction: row;'>
            <button @click='fetchGetTest'>fetchGetTest</button>
            <button @click='fetchGetNoIdUrlTest'>fetchGetNoIdUrlTest</button>
            <button @click='fetchFromBodyTest'>fetchFromBodyTest</button>
		</view>
		<view style='div:flex; flex-wrap:wrap; flex-direction: row;'>
            <button @click='axiosGetTest'>axiosGetTest</button>
            <button @click='axiosGetNoIdUrlTest'>axiosGetNoIdUrlTest</button>
            <button @click='axiosFromBodyTest'>axiosFromBodyTest</button>
        </view>
		<view style='div:flex; flex-wrap:wrap; flex-direction: row;'>
            <button @click='jqueryGetTest'>jqueryGetTest</button>
            <button @click='jqueryGetNoIdUrlTest'>jqueryGetNoIdUrlTest</button>
            <button @click='jqueryFromBodyTest'>jqueryFromBodyTest</button>
        </view>
		<view style='div:flex; flex-wrap:wrap; flex-direction: row;'>
            <button @click='uniappGetTest'>uniappGetTest</button>
            <button @click='uniappGetNoIdUrlTest'>uniappGetNoIdUrlTest</button>
            <button @click='uniappFromBodyTest'>uniappFromBodyTest</button>
        </view>
		<view style='div:flex; flex-wrap:wrap; flex-direction: row;'>
            <button @click='wechatlittleAppGetTest'>wechatlittleAppGetTest</button>
            <button @click='wechatlittleAppGetNoIdUrlTest'>wechatlittleAppGetNoIdUrlTest</button>
            <button @click='wechatlittleAppFromBodyTest'>wechatlittleAppFromBodyTest</button>
        </view>
		<h6>Request Url</h6>
		<view style='div: flex; flex-wrap: wrap;'>{{url}}</view>
		<h6>Request Content</h6>
		<view>{{JSON.stringify(content)}}</view>
		<h6>Request response</h6>
		<view>{{response}}</view>
	</view>
</template>

<script lang="ts">
    import { Hongbo } from '@/auto/RootControlInterfaces';
import Vue from 'vue';
	export default Vue.extend({
		data() {
			return {
				title: 'Hello',
				response: "",
				url: "",
				content: {}
			}
		},
		onLoad() {

		},
		methods: {
			jumpToControleExample() {
				uni.navigateTo({
					url: "../autouse/index"
				});
			},
			fetchGetTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/1234";
    			let content: Hongbo.IMethodBodyHeader = { method: "get", headers: { "accept": "application/json" }};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithFetch(this.url, content, null).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			fetchGetNoIdUrlTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/";
    			let content: Hongbo.IMethodBodyHeader = { method: "get", headers: { "accept": "application/json" }};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithFetch(this.url, content, null).then((x) => {
        			this.response = JSON.stringify(x);
    			});   
			},
			fetchFromBodyTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/";
    			let content: Hongbo.IMethodBodyHeader = { method: "post", headers: { "accept": "application/json", "Content-Type": "application/json" }, 
					body: JSON.stringify({Name: "daiwei"})
				};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithFetch(this.url, content, null).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			axiosGetTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/1234";
    			let content: Hongbo.IMethodBodyHeader = { method: "get", headers: { "accept": "application/json" }};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithAxios(this.url, content).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			axiosGetNoIdUrlTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/";
    			let content: Hongbo.IMethodBodyHeader = { method: "get", headers: { "accept": "application/json" }};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithAxios(this.url, content).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			axiosFromBodyTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/";
    			let content: Hongbo.IMethodBodyHeader = { method: "post", headers: { "accept": "application/json", "Content-Type": "application/json" }, 
					body: JSON.stringify({Name: "daiwei"})
				};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithAxios(this.url, content).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			jqueryGetTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/1234";
    			let content: Hongbo.IMethodBodyHeader = { method: "get", headers: { "accept": "application/json" }};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithJquery(this.url, content).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			jqueryGetNoIdUrlTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/";
    			let content: Hongbo.IMethodBodyHeader = { method: "get", headers: { "accept": "application/json" }};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithJquery(this.url, content).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			jqueryFromBodyTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/";
    			let content: Hongbo.IMethodBodyHeader = { method: "post", headers: { "accept": "application/json", "Content-Type": "application/json" }, 
					body: JSON.stringify({Name: "daiwei"})
				};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithJquery(this.url, content).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			uniappGetTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/1234";
    			let content: Hongbo.IMethodBodyHeader = { method: "get", headers: { "accept": "application/json" }};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithUniapp(this.url, content).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			uniappGetNoIdUrlTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/";
    			let content: Hongbo.IMethodBodyHeader = { method: "get", headers: { "accept": "application/json" }};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithUniapp(this.url, content).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			uniappFromBodyTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/";
    			let content: Hongbo.IMethodBodyHeader = { method: "post", headers: { "accept": "application/json", "Content-Type": "application/json" }, 
					body: JSON.stringify({Name: "daiwei"})
				};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithUniapp(this.url, content).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			wechatlittleAppGetTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/1234";
    			let content: Hongbo.IMethodBodyHeader = { method: "get", headers: { "accept": "application/json" }};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithWechatLittleapp(this.url, content).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			wechatlittleAppGetNoIdUrlTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/";
    			let content: Hongbo.IMethodBodyHeader = { method: "get", headers: { "accept": "application/json" }};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithWechatLittleapp(this.url, content).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			wechatlittleAppFromBodyTest() {
			    this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/";
    			let content: Hongbo.IMethodBodyHeader = { method: "post", headers: { "accept": "application/json", "Content-Type": "application/json" }, 
					body: JSON.stringify({Name: "daiwei"})
				};
				this.content = JSON.stringify(content);
    			Hongbo.HongboRootControl.requestWithWechatLittleapp(this.url, content).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			}
		}
	});
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin: 200rpx auto 50rpx auto;
	}

	.text-area {
		display: flex;
		justify-content: center;
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
	}
</style>
