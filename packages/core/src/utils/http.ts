/**
 * 网络请求相关实用方法
 */
import { GenericConfigObject } from '@tang/common';

import 'isomorphic-unfetch';

export interface HttpRequestOptions extends RequestInit, GenericConfigObject {
  type?: 'text' | 'json' | 'buffer' | 'blob' | string;
}

// 网络请求
export async function request<T>(
  input: RequestInfo,
  options: HttpRequestOptions = {},
) {
  const res = await fetch(input, options);

  if (!res.ok) {
    const text = await res.text();
    let errorMsg = res.statusText;
    if (text.length <= 100) errorMsg = text;
    throw new Error(errorMsg);
  }

  let result: any;

  let resType = options.type;

  if (!resType) {
    const contentType = res.headers.get('content-type');
    if (contentType === 'application/json') {
      resType = 'json';
    }
  }

  switch (resType) {
    case 'buffer':
      result = await res.arrayBuffer();
      break;
    case 'blob':
      result = await res.blob();
      break;
    case 'json':
      result = await res.json();
      break;
    default:
      result = await res.text();
      break;
  }

  return result as T;
}
