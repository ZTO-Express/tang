/** Api项目服务配置 */
export interface YApiServiceConfig {
  url: string; // 文档地址
  token: string; // 项目token
}

/** Api Tag */
export interface ApiTag {
  _id: string;
  name: string;
  desc: string;
}

/** Api基类 */
export interface ApiBaseItem {
  _id: string | number;
  title: string;
  [prop: string]: any; // 其他配置
}

/** Api项目 */
export interface ApiProjectItem extends ApiBaseItem {
  tag: ApiTag[];
}

/** Api分类 */
export interface ApiCategoryItem extends ApiBaseItem {
  projectId: string | number;
}

/** Api信息 */
export interface ApiItem extends ApiBaseItem {
  _isDetail: boolean;
  projectId: string | number;
  catId: string | number;
  method?: string;
  tag?: string[];
  path?: string;
  reqBodyType?: string;
  reqHeaders?: any[];
  reqQuery?: any[];
  reqParams?: any[];
  reqBody?: any;
  reqBodyForm?: any[];
  resBodyType?: string;
  resBody?: any;
  desc?: string;
  markdown?: string;
}
