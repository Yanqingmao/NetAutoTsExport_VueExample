<template>
	<view class="content">
		<view>
			测试自动产生Controller库中的使用方法 
		</view>
		<view style='div:flex; flex-wrap:wrap; flex-direction: row;'>
            <button @click='jumpToRootControlExample'>Jump To RootControl Example</button>
		</view>
		<view style='div:flex; flex-wrap:wrap; flex-direction: row;'>
            <button @click='axios_Get_NoParameter_Test'>axios_Get_NoParameter_Test</button>
            <button @click='axios_Get_Id_Test'>axios_Get_Id_Test</button>
            <button @click='axios_post_withBody_Test(false)'>axios_post_withBody_Test</button>
            <button @click='axios_post_withBody_Test(true)'>axios_post_withBody_Prehandle_Test</button>
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
    import * as Root from '@/auto/control';
	import * as Entitys from '@/auto/entity';
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
			jumpToRootControlExample() {
				uni.navigateTo({
					url: "../index/index"
				});
			},
			axios_Get_NoParameter_Test() {
			   // this.url = "http://localhost/TsGenAspnetExample/api/noanyattrwebapi/1234";
    		   // let content: Hongbo.IMethodBodyHeader = { method: "get", headers: { "accept": "application/json" }};
			   // this.content = JSON.stringify(content);
    			Root.TsGenAspnetExample.Controllers.NoAnyAttrWebapiController.get().then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			axios_Get_Id_Test() {
    			Root.TsGenAspnetExample.Controllers.NoAnyAttrWebapiController.Get(1234).then((x) => {
        			this.response = JSON.stringify(x);
    			});
			},
			axios_post_withBody_Test(prehandleResponse: boolean = false) {  
			    let person: Entitys.TsGenAspnetExample.Models.Person = new Entitys.TsGenAspnetExample.Models.PersonImpl();
				if (prehandleResponse) {
					person.Name = "Yongxin Wang"; 
				} else {
					person.Name = "Dayang Li"; 
				}
				Root.Hongbo.HongboRootControl.SetGlobalAfterRequest({
					neeClearAfterCalled: true,
					prehandle:  (url, content, resultPromise) => {
						return resultPromise.then((data) => {
							let result: Entitys.TsGenAspnetExample.Models.Person = data as Entitys.TsGenAspnetExample.Models.Person;
							if (result.Name?.indexOf("Yongxin Wang")??0 >= 0) {
								return Promise.reject(result);
							}
							else {
								return Promise.resolve(result);
							}
						});
					}
				});
    			Root.TsGenAspnetExample.Controllers.NoAnyAttrWebapiController.Post(person).then((x) => {
        			this.response = JSON.stringify(x);
    			}).catch((e) => {
					alert(e);
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
		margin: 6px;
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
