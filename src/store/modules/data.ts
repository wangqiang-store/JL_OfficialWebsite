const data: any = {
  state: {
    // 前台父模块数据
    frontParent: [],
    // 前台头部导航栏数据
    headNav: [],
    // 前台子模块数据
    frontSub: [],
    // 搜索loading
    searchLoading: false,
  },
  mutations: {
    SET_FrontParent: (state: any, data: any) => {
      state.frontParent = data;
    },
    SET_HeadNav: (state: any, data: any) => {
      state.headNav = data;
    },
    SET_FrontSub: (state: any, data: any) => {
      state.frontSub = data;
    },
    SET_SearchLoading: (state: any, data: boolean) => {
      state.searchLoading = data;
    },
  },
  actions: {},
  getters: {},
};

export default data;
