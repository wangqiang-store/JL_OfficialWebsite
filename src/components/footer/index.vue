<template>
  <div class="footer">
    <div class="footer_container d_flex">
      <!-- 快捷入口版本 -->

      <!-- <div
        style="height:100%"
        class="footer_left"
      >
        <el-image
          style="width: 150px; height: 100%"
          :src="require('../../assets/images/logo.jpg')"
          fit="cover"
        ></el-image>
        <div>
          <el-image
            v-if="enterpriseInfo.weChat"
            style="width: 100px; height: 100%"
            :src="`${IMG_File}${enterpriseInfo.weChat}`"
            fit="cover"
          ></el-image>
          <p style="text-align:center">企业微信</p>
        </div>
      </div>
      <div class="footer_mid">
        <h4 style="text-align:left;font-size:14px">快捷入口</h4>
        <ul class="d_flex">
          <li
            v-for="item of navList"
            :key="item.id"
          >
            <h5>{{item.title}}</h5>
            <template v-if="item.children!=null && item.children.length>0">
              <p
                v-for="val of item.children"
                :key="val.id"
                @click="handleNavModule(val)"
              >
                {{val.title}}
              </p>
            </template>
          </li>
        </ul>
      </div>
      <div class="footer_right">
        <h4 style="text-align:left;font-size:14px;color:#000">联系我们</h4>
        <div style="padding:5px 0;margin-top: 10px;">
          <p>
            公司名称： {{enterpriseInfo.name}}
          </p>

          <p>
            电话：{{enterpriseInfo.phone}}
          </p>
          <p>
            地址：{{enterpriseInfo.address}}
          </p>
          <p>
            传真：{{enterpriseInfo.hotLine}}
          </p>
          <p>
            邮箱：{{enterpriseInfo.email}}
          </p>
        </div>
      </div> -->

      <!-- 普通官网版本 -->

      <div
        class="footer_left"
        style="height:100%"
      >
        <div
          style="padding:5px 0;margin-top: 10px; flex-wrap: wrap;"
          class="d_flex"
        >
          <p>
            公司名称： {{enterpriseInfo.name}}
          </p>

          <p>
            电话：{{enterpriseInfo.phone}}
          </p>
          <p>
            地址：{{enterpriseInfo.address}}
          </p>
          <p>
            传真：{{enterpriseInfo.fax}}
          </p>
          <p>
            邮箱：{{enterpriseInfo.email}}
          </p>
        </div>
      </div>
      <div class="footer_right">
        <el-image
          style="width: 400px"
          :src="require('../../assets/images/dbg.png')"
          fit="cover"
        ></el-image>
        <el-popover
          placement="top"
          trigger="hover"
          :width="150"
          popper-class="footer_right_popper"
        >
          <template #reference>
            <el-image
              style="width:50px;height:50px"
              :src="require('../../assets/images/wx.png')"
              fit="cover"
              class="footer_right_wx"
            ></el-image>
          </template>
          <el-image
            v-if="enterpriseInfo.weChat"
            style="width: 100px; height: 100%;text-align:center;margin-left:14px"
            :src="`${IMG_File}${enterpriseInfo.weChat}`"
            fit="cover"
            class="footer_right_wx_img"
          ></el-image>
        </el-popover>
      </div>
    </div>
    <div class="footer_container_btm">
      <span>版权所有 © 广州劲联智能科技有限公司</span>
      <a
        href="http://www.beian.gov.cn/portal/index.do"
        target="_blank"
        class="footer_container_btm_security"
      >
        <img
          src="http://www.beian.gov.cn/img/ghs.png"
          alt=""
        />
        {{enterpriseInfo.security}}
      </a>
      <a
        href="https://beian.miit.gov.cn/#/Integrated/index"
        target="_blank"
        class="footer_container_btm_icp"
      >{{enterpriseInfo.icp}}</a>
    </div>
    <!-- 固定框 -->
    <FixedBox
      :consultation="enterpriseInfo.consultation"
      :hotLine="enterpriseInfo.hotLine"
    />
  </div>
</template>
<script lang="ts">
import { RES_SUCCESS, sessionRead } from '@/api/common/common';
import { getPage, getParentModuleMedia } from '@/api/homePage/homePage';
import { IMG_File } from '@/api/common/common';
import { defineComponent, onMounted, reactive, toRefs, watch } from 'vue';
import FixedBox from '@/components/fixedBox/index.vue';

import { useRouter } from 'vue-router';
export default defineComponent({
  components: {
    FixedBox,
  },
  setup() {
    const ROUTER = useRouter();
    let DATA: any = reactive({
      enterpriseInfo: {},
      navList: [],
    });
    let METHODS: any = reactive({
      // 获取企业信息
      handleGetInfo: async () => {
        let { data } = await getPage();
        if (data.code === RES_SUCCESS) {
          DATA.enterpriseInfo = data.data;
        }
      },
      // 获取首页头部模块数据
      handleGetParentModuleMedia: async () => {
        if (sessionRead('HEADNAV')) {
          DATA.navList = METHODS.formattData([], sessionRead('HEADNAV'));
          return;
        }
        let { data } = await getParentModuleMedia();
        DATA.navList = METHODS.formattData([], data.data);
      },
      // 格式化 路由数组
      formattData: (list: any[], data: any[]) => {
        data.forEach((item) => {
          let obj = {
            id: item.id,
            title: item.name,
            image: item.image,
            type: item.type,
            parentId: item.parentId,
            reference: item.reference,
            children: [],
          };
          list.push(obj);
          if (item.children != null && item.children.length > 0) {
            METHODS.formattData(obj.children, item.children);
          }
        });
        return list;
      },
      // 点击子模块
      handleNavModule: async (item: any) => {
        switch (item.type) {
          case 1:
            ROUTER.push({
              name: 'frontpageSingleImg',
              query: { id: item.id, parentId: item.parentId },
            });
            break;
          case 2:
            ROUTER.push({
              name: 'frontpageMoreImg',
              query: { id: item.id, parentId: item.parentId },
            });
            break;
          case 3:
            ROUTER.push({
              name: 'frontpageSingleVideo',
              query: { id: item.id, parentId: item.parentId },
            });
            break;
          case 4:
            ROUTER.push({
              name: 'frontpageMoreVideo',
              query: { id: item.id, parentId: item.parentId },
            });
            break;
          case 5:
            ROUTER.push({
              name: 'frontpageSingleDoc',
              query: { id: item.id, parentId: item.parentId },
            });
            break;
          case 6:
            ROUTER.push({
              name: 'frontpageMoreDoc',
              query: { id: item.id, parentId: item.parentId },
            });
            break;
          case 7:
            ROUTER.push({
              name: 'frontpageTwoDoc',
              query: { id: item.id, parentId: item.parentId },
            });
            break;
          case 8:
            let type = '';
            sessionRead('FRONTSUB').forEach((val: any) => {
              if (item.reference === val.id) {
                type = val.type;
              }
            });
            let itemObj = Object.assign(
              {},
              { ...item, type, id: item.reference }
            );
            METHODS.handleNavModule(itemObj);
            break;
          default:
            break;
        }
      },
    });
    onMounted(() => {
      METHODS.handleGetInfo();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      IMG_File,
    };
  },
});
</script>
<style lang="scss" scoped>
.footer {
  width: 100%;
  // padding: 10px 0;
  // background: #4f4f4f;
  background: #4f4f4f;
  height: auto;
  color: #636363;
  text-align: center;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  .el-image {
    // margin-left: 40px;
    /deep/ .el-image__inner {
      user-select: none;
      -webkit-user-drag: none;
    }
  }
  .footer_container {
    // max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    margin-top: 20px;
    justify-content: center;
    // border-top: 1px solid #e6e6e6;
    .footer_left {
      text-align: center;
      padding: 10px;
      max-width: 1000px;
      color: #a1a1a1;
      p {
        width: 50%;
        text-align: left;
        margin-bottom: 10px;
      }
    }
    .footer_mid {
      width: 600px;
      padding: 10px 20px 10px 20px;
      border-right: 1px solid #e5e5e5;
      border-left: 1px solid #e5e5e5;
      margin-top: 10px;
      ul {
        margin-top: 10px;
        li {
          min-height: 150px;
          flex: 1;
          h5 {
            margin-bottom: 5px;
          }
          p {
            color: #9d9d9d;
            font-size: 12px;
            margin-bottom: 5px;
            cursor: pointer;
          }
        }
      }
    }
    .footer_right {
      padding: 0 20px 0 20px;
      font-size: 12px;
      color: #c1c1c1;
      text-align: left;
      position: relative;
      /deep/ .el-image__inner {
        user-select: none;
        -webkit-user-drag: none;
      }
      .footer_right_wx {
        position: absolute;
        top: 30%;
        left: 50%;
        /deep/ .el-image__inner {
          user-select: none;
          -webkit-user-drag: none;
        }
      }
    }
  }
  .footer_container_btm {
    width: 100%;
    margin: 0 auto;
    margin-top: 20px;
    padding: 50px;
    // border-top: 1px solid #e5e5e5;
    font-size: 12px;
    color: #a1a1a1;
    background-color: #4f4f4f;
    .footer_container_btm_security {
      margin-right: 10px;
      margin-left: 10px;
      color: #a1a1a1;
      &:hover {
        color: lightskyblue;
      }
    }
    .footer_container_btm_icp {
      color: #a1a1a1;
      &:hover {
        color: lightskyblue;
      }
    }
  }
  .footer_right_popper {
    /deep/ .el-image__inner {
      user-select: none;
      -webkit-user-drag: none;
    }
  }
}
</style>