<template>
  <div class="main_container">
    <!-- 首页轮播图 -->
    <div class="swiper-container">
      <!-- Additional required wrapper -->
      <div class="swiper-wrapper">
        <!-- Slides -->
        <div
          class="swiper-slide"
          v-for="item in bigImageList"
          :key="item"
        >
          <img
            :src="`${IMG_File}${item.image}`"
            class="carousel_item_image"
            obj-fit="cover"
          >
          <p
            class="ani swiper-slide_title1"
            swiper-animate-effect="animate__bounceInRight"
            swiper-animate-duration="1s"
            swiper-animate-delay="0s"
          > {{item.title1}}</p>
          <p
            class="ani swiper-slide_title2"
            swiper-animate-effect="animate__bounceInRight"
            swiper-animate-duration="4s"
            swiper-animate-delay="0s"
          >
            {{item.title2}}
          </p>

        </div>
      </div>
      <!-- If we need pagination -->
      <div class="swiper-pagination"></div>

      <!-- If we need navigation buttons -->
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>

      <!-- If we need scrollbar -->
      <div class="swiper-scrollbar"></div>
    </div>

    <!-- 案例展示 -->
    <div class="container_products">
      <el-row class="container_products_item">
        <el-col>
          <h4 style="margin:30px 0;text-align:center">
            <span>PRODUCTS</span> 案例展示
          </h4>
        </el-col>
      </el-row>
      <el-row
        style="margin:10px 0"
        v-for="item of caseShowList"
        :key="item.id"
      >
        <el-col class="hovercard">
          <div
            class="case_item_card"
            @click="handleClickProducts(item)"
          >
            <img
              :src="`${IMG_File}${item.image}`"
              alt="Image"
            >
            <p>{{item.name}}</p>
          </div>
        </el-col>
      </el-row>
      <el-row class="container_products_item"></el-row>
    </div>

    <!-- 轮播文档 -->
    <div
      class="wrapper"
      @mousemove="handlePause()"
      @mouseleave="handlePlay"
    >
      <div class="boxes">
        <div
          class="box"
          v-for="item in carouseDocList"
          :key="item.id"
          @click="handleClickCarouseDoc(item)"
        >
          <img
            width="390"
            height="300"
            :src="`${IMG_File}${item.image}`"
          >
          <p style="text-align:center;font-size:16px">{{item.title}}</p>
        </div>
      </div>
    </div>

  </div>
</template>
<script lang="ts">
import {
  IMG_File,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
// import Swiper JS
import Swiper from 'swiper/bundle';
// import Swiper styles
import 'swiper/swiper-bundle.css';
import {
  swiperAnimateCache,
  swiperAnimate,
} from '@/assets/ts/swiper.animate1.0.3.min';
import {
  findType,
  getAllCarouselDocument,
  getAllCarouselPictures,
  getAllCaseShow,
} from '@/api/homePage/homePage';
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  toRefs,
} from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
export default defineComponent({
  components: {},
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    // 获取路由实例
    const ROUTER = useRouter();
    const STORE = useStore();
    let DATA: any = reactive({
      // 轮播图片
      bigImageList: [],
      // 案例展示
      caseShowList: [],
      // 轮播文档
      carouseDocList: [],
      // 父模块
      parentList: [],
      // 子模块
      subList: [],
      mySwiper: '',
      myDocSwiper: '',
      isSubId: false,
      xTrans: [],
      animation: '',
    });

    let METHODS: any = reactive({
      // 获取所有轮播图片
      handleGetAllCarouse: async () => {
        let { data } = await getAllCarouselPictures();
        if (data.code === RES_SUCCESS) {
          DATA.bigImageList = [
            {
              image: data.data[0]
                ? data.data[0].image
                : require('@/assets/images/carousel/主题3：致力于智能制造生产综合管理系统技术应用.jpg'),
              title1: '致力于',
              title2: '智能制造生产综合管理系统技术应用',
            },
            {
              image: data.data[1]
                ? data.data[1].image
                : require('@/assets/images/carousel/主题4：致力于智能化工程设计与施工.jpg'),
              title1: '致力于',
              title2: '智能化工程设计与施工',
            },
            {
              image: data.data[2]
                ? data.data[2].image
                : require('@/assets/images/carousel/主图2：致力于智慧应急管理系统技术应用.jpg'),
              title1: '致力于',
              title2: '智慧应急管理系统技术应用',
            },
            {
              image: data.data[3]
                ? data.data[3].image
                : require('@/assets/images/carousel/主题1：致力于电网供配电系统智能感知技术应用.jpg'),
              title1: '致力于',
              title2: '电网供配电系统智能感知技术应用',
            },
          ];
          // DATA.bigImageList = data.data;
          nextTick(() => {
            METHODS.initSwiper();
          });
        }
      },
      // 获取所有案例展示
      handleGetAllCaseShow: async () => {
        let { data } = await getAllCaseShow();
        if (data.code === RES_SUCCESS) {
          DATA.caseShowList = data.data;
        }
      },
      // 获取所有轮播文档
      handleGetAllCarouseDoc: async () => {
        let { data } = await getAllCarouselDocument();
        if (data.code === RES_SUCCESS) {
          DATA.carouseDocList = data.data;
          nextTick(() => {
            // METHODS.initDocSwiper();
            METHODS.initAnime();
          });
        }
      },
      // 点击轮播文档
      handleClickCarouseDoc: (item: any) => {
        METHODS.handleRedirect(item);
        if (item.referenceType) {
          let type: any = '';
          sessionRead('FRONTSUB').forEach((val: any) => {
            if (item.reference === val.id) {
              type = val.type;
            }
          });
          let itemObj = Object.assign({}, { ...item, type });
          let query = {
            id: itemObj.submoduleId,
            refId: itemObj.reference,
            parentId: itemObj.parentModuleId,
          };
          switch (type) {
            case 1:
              ROUTER.push({ name: 'frontpageSingleImg', query });
              break;
            case 2:
              ROUTER.push({ name: 'frontpageMoreImg', query });
              break;
            case 3:
              ROUTER.push({ name: 'frontpageSingleVideo', query });
              break;
            case 4:
              ROUTER.push({ name: 'frontpageMoreVideo', query });
              break;
            case 5:
              ROUTER.push({ name: 'frontpageSingleDoc', query });
              break;
            case 6:
              ROUTER.push({ name: 'document', query });
              break;
            case 7:
              ROUTER.push({ name: 'document', query });
              break;
            default:
              break;
          }
        }
      },
      initSwiper: () => {
        DATA.mySwiper = new Swiper('.swiper-container', {
          on: {
            init: function () {
              swiperAnimateCache();
              swiperAnimate(this);
            },
            slideChangeTransitionStart: function () {},
            slideChangeTransitionEnd: function () {},
            slideChange: function () {
              swiperAnimate(this);
            },
          },
          autoplay: {
            disableOnInteraction: false, // 用户操作swiper之后，是否禁止autoplay （没有加入之前轮播图设置 autoplay：true无效）
            delay: 4000, // 自动切换的时间间隔（单位ms）
          },
          loop: true,
          direction: 'horizontal' /*横向滑动*/,
          // 如果需要分页器
          pagination: {
            el: '.swiper-pagination',
          },
          // 如果需要前进后退按钮
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          observeParents: true, //必须加入
          observer: true, //必须加入
        });
      },
      // 初始化轮播文档轮播
      initDocSwiper: () => {
        DATA.myDocSwiper = new Swiper('.swiper-container-document', {
          autoplay: {
            disableOnInteraction: false, // 用户操作swiper之后，是否禁止autoplay （没有加入之前轮播图设置 autoplay：true无效）
            delay: 2000, // 自动切换的时间间隔（单位ms）
          },
          loop: true,
          direction: 'horizontal' /*横向滑动*/,

          slidesPerView: 'auto',
          spaceBetween: 20,
          centeredSlidesBounds: true,
          slidesOffsetBefore: 0,
          loopedSlides: 4,
          // 如果需要分页器
          // pagination: {
          //   el: '.swiper-pagination-document',
          // },
          // 如果需要前进后退按钮
          // navigation: {
          //   nextEl: '.swiper-button-next-document',
          //   prevEl: '.swiper-button-prev-document',
          // },
          observeParents: true, //必须加入
          observer: true, //必须加入
        });
      },
      // 点击案例展示
      handleClickProducts: (item: any) => {
        METHODS.handleRedirect(item);
        if (item.type == 8) {
          let type: any = '';
          sessionRead('FRONTSUB').forEach((val: any) => {
            if (item.reference === val.id) {
              type = val.type;
            }
          });
          let itemObj = Object.assign({}, { ...item, type });
          let query = {
            id: itemObj.submoduleId,
            refId: itemObj.reference,
            parentId: itemObj.parentModuleId,
          };
          switch (type) {
            case 1:
              ROUTER.push({ name: 'frontpageSingleImg', query });
              break;
            case 2:
              ROUTER.push({ name: 'frontpageMoreImg', query });
              break;
            case 3:
              ROUTER.push({ name: 'frontpageSingleVideo', query });
              break;
            case 4:
              ROUTER.push({ name: 'frontpageMoreVideo', query });
              break;
            case 5:
              ROUTER.push({ name: 'frontpageSingleDoc', query });
              break;
            case 6:
              ROUTER.push({ name: 'document', query });
              break;
            case 7:
              ROUTER.push({ name: 'document', query });
              break;
            default:
              break;
          }
        }
      },
      // 封装跳转页面
      handleRedirect: (item: any) => {
        // 判断父模块是否存在
        let bool = sessionRead('FRONTPARENT').some((val: any) => {
          return val.id === item.parentModuleId;
        });
        if (!bool) {
          ROUTER.push('/NotFound');
          return;
        }
        DATA.isSubId = false;
        sessionRead('FRONTSUB').forEach((val: any) => {
          if (val.id === item.submoduleId) {
            item.type = val.type;
            DATA.isSubId = true;
          }
        });
        if (!DATA.isSubId) {
          ROUTER.push('/NotFound');
          return;
        }
        // 判断是否为引用类型
        let query = { id: item.submoduleId, parentId: item.parentModuleId };
        switch (item.type) {
          case 1:
            ROUTER.push({ name: 'frontpageSingleImg', query });
            break;
          case 2:
            ROUTER.push({ name: 'frontpageMoreImg', query });
            break;
          case 3:
            ROUTER.push({ name: 'frontpageSingleVideo', query });
            break;
          case 4:
            ROUTER.push({ name: 'frontpageMoreVideo', query });
            break;
          case 5:
            ROUTER.push({ name: 'frontpageSingleDoc', query });
            break;
          case 6:
            ROUTER.push({ name: 'frontpageMoreDoc', query });
            break;
          case 7:
            ROUTER.push({ name: 'frontpageTwoDoc', query });
            break;
          default:
            break;
        }
      },
      // 初始化走马灯
      initAnime: () => {
        // DATA.xTrans = [];
        proxy.$anime.set('.box', {
          translateX: function (el: any, i: number, l: any) {
            DATA.xTrans[i] = { x: i * 400 };
            return i * 400;
          },
        });
        DATA.animation = proxy.$anime({
          targets: DATA.xTrans,
          duration: 40000, //走一周持续时间
          easing: 'linear',
          x: `-=${400 * DATA.carouseDocList.length}`,
          loop: true,
          update: function (anim: any) {
            proxy.$anime.set('.box', {
              translateX: function (el: any, i: number, l: any) {
                return DATA.xTrans[i].x % (400 * DATA.carouseDocList.length) > 0
                  ? DATA.xTrans[i].x % (400 * DATA.carouseDocList.length)
                  : (DATA.xTrans[i].x % (400 * DATA.carouseDocList.length)) +
                      400 * DATA.carouseDocList.length;
              },
            });
          },
        });
        // animation.pause();
      },
      handlePlay: () => {
        DATA.animation && DATA.animation.play();
      },
      handlePause: () => {
        DATA.animation && DATA.animation.pause();
      },
      // 获取前台路由类型
      handleFindType: async () => {
        if (!sessionRead('FRONTSUBTYPE')) {
          let { data } = await findType();
          if (data.code === RES_SUCCESS) {
            sessionWrite('FRONTSUBTYPE', data.data);
          }
        }
      },
    });
    onMounted(() => {
      METHODS.handleGetAllCarouse();
      METHODS.handleGetAllCaseShow();
      METHODS.handleGetAllCarouseDoc();
    });
    onUnmounted(() => {
      DATA.animation.remove(DATA.xTrans);
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
.main_container {
  width: 100%;
  margin-top: 100px;
  /deep/ .el-carousel__container {
    width: 100%;
    height: 720px;
    margin-bottom: 10px;
  }
  .carousel_item_image {
    width: 100%;
    /deep/ .el-image__inner {
      width: 100%;
      height: 720px;
      user-select: none;
      -webkit-user-drag: none;
    }
  }
  .swiper-button-prev,
  .swiper-button-next {
    color: rgba(171, 178, 191, 0.5);
  }
  .swiper-button-prev:hover,
  .swiper-button-next:hover {
    color: #1a73e8;
  }
  .container_products {
    max-width: 2000px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 20px 0 50px 0;
    /* background-color: #f1f1f1; */
    .container_products_item {
      height: 146px;
      background-color: #f1f1f1;
      margin-right: 1px;
      margin-left: 5px;
      flex: 2;
      justify-content: center;
      align-items: center;
    }
    .hovercard {
      width: 200px;
      // height: 150px;
      cursor: pointer;
      padding: 5px;
    }
    .case_item_card:hover {
      transform: scale(1.1);
      box-shadow: 0 0 2px 2px #f1f1f1;
      // background-color: #ffd04b;
      background-color: $theme-colors;
      color: #f1f1f1;
    }
    .case_item_card {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px solid #d8d8d8;
      padding: 10px 0 10px 0;
      background-color: #f1f1f1;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.5s;
      img {
        width: 100%;
        height: 105px;
      }
    }
  }
  // 项目展示
  .project_carousel {
    max-width: 665px !important;
    margin: 0 auto !important;
    .el-carousel__container {
      height: auto;
    }
    // .el-carousel__item {
    // width: 300px;
    // }
  }

  /deep/ .swiper-slide {
    width: 100% !important;
    height: 720px;
    position: relative;
    .swiper-slide0_title1 {
      position: absolute;
      top: 40%;
      left: 20%;
      color: #c4cde9;
      font-size: 48px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .swiper-slide0_title2 {
      position: absolute;
      top: 48%;
      left: 20%;
      color: #c4cde9;
      font-size: 20px;
    }
    .swiper-slide1_title1 {
      position: absolute;
      top: 40%;
      left: 20%;
      color: #c4cde9;
      font-size: 48px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .swiper-slide1_title2 {
      position: absolute;
      top: 48%;
      left: 20%;
      color: #c4cde9;
      font-size: 20px;
    }
    .swiper-slide2_title1 {
      position: absolute;
      top: 40%;
      left: 20%;
      color: #c4cde9;
      font-size: 48px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .swiper-slide2_title2 {
      position: absolute;
      top: 48%;
      left: 20%;
      color: #c4cde9;
      font-size: 20px;
    }
    .swiper-slide_title1 {
      position: absolute;
      top: 30%;
      left: 10%;
      color: #c4cde9;
      font-size: 36px;
    }
    .swiper-slide_title2 {
      position: absolute;
      top: 38%;
      left: 14%;
      color: #c4cde9;
      font-size: 36px;
    }
    img {
      width: 100%;
      height: 720px;
    }
  }
  .swiper-container {
    width: 100%;
    height: 720px;
  }
  .swiper-container-document {
    max-width: 1200px;
    height: 300px;
    margin: 0 auto;
    overflow: hidden;
    .swiper-slide {
      width: 24% !important;
      height: 300px;
      cursor: pointer;
    }
    img {
      width: 300px;
      height: 200px;
    }
  }
  // 走马灯
  .wrapper {
    max-width: 1600px;
    height: 350px;
    position: relative;
    margin: 40px auto 0;
    background: #fff;
    overflow: hidden;
    margin-bottom: 40px;
  }
  .box {
    width: 400px;
    height: 350px;
    position: absolute;
    // background: red;
    font-size: 25px;
    // line-height: 250px;
    text-align: center;
    margin-right: 10px;
    cursor: pointer;
    p {
      position: absolute;
      bottom: 0;
      font-size: 14px;
      width: 100%;
      height: 40px;
    }
    img {
      user-select: none;
      -webkit-user-drag: none;
    }
  }
  // .box:nth-child(odd) {
  //   background: #f8f8f8;
  // }
  // .box:nth-child(even) {
  //   background: #eee;
  // }
  .boxes {
    position: relative;
    left: -400px;
  }
}
</style>