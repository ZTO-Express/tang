import { strings } from '../../src/utils';

describe('utils/strings：字符串转换相关处理', () => {
  it('decamelize, 将驼峰格式转换为下划线格式', () => {
    expect(strings.decamelize('')).toBe('');
    expect(strings.decamelize('innerHTML')).toBe('inner_html');
    expect(strings.decamelize('action_name')).toBe('action_name');
    expect(strings.decamelize('css-class-name')).toBe('css-class-name');
    expect(strings.decamelize('my favorite items')).toBe('my favorite items');
  });

  it('dasherize, 将字符转换为中划线名称', () => {
    expect(strings.dasherize('')).toBe('');
    expect(strings.dasherize('innerHTML')).toBe('inner-html');
    expect(strings.dasherize('action_name')).toBe('action-name');
    expect(strings.dasherize('css-class-name')).toBe('css-class-name');
    expect(strings.dasherize('my favorite items')).toBe('my-favorite-items');
  });

  it('camelize, 将字符转换为驼峰名称', () => {
    expect(strings.camelize('')).toBe('');
    expect(strings.camelize('_')).toBe('');
    expect(strings.camelize('-')).toBe('');
    expect(strings.camelize('.')).toBe('');
    expect(strings.camelize('innerHTML')).toBe('innerHTML');
    expect(strings.camelize('action_name')).toBe('actionName');
    expect(strings.camelize('action.name')).toBe('actionName');
    expect(strings.camelize('css-class-name')).toBe('cssClassName');
    expect(strings.camelize('my favorite items')).toBe('myFavoriteItems');
    expect(strings.camelize('My Favorite Items')).toBe('myFavoriteItems');
  });

  it('classify, 将字符转换为类名称', () => {
    expect(strings.classify('')).toBe('');
    expect(strings.classify('innerHTML')).toBe('InnerHTML');
    expect(strings.classify('action_name')).toBe('ActionName');
    expect(strings.classify('action.name')).toBe('Action.Name');
    expect(strings.classify('css-class-name')).toBe('CssClassName');
    expect(strings.classify('my favorite items')).toBe('MyFavoriteItems');
    expect(strings.classify('My Favorite Items')).toBe('MyFavoriteItems');
  });

  it('underscore, 将字符转换为下划线名称', () => {
    expect(strings.camelize('')).toBe('');
    expect(strings.underscore('innerHTML')).toBe('inner_html');
    expect(strings.underscore('inner6HTML')).toBe('inner6_html');
    expect(strings.underscore('inner6H7TML')).toBe('inner6_h7_tml');
    expect(strings.underscore('action_name')).toBe('action_name');
    expect(strings.underscore('css-class-name')).toBe('css_class_name');
    expect(strings.underscore('my favorite items')).toBe('my_favorite_items');
    expect(strings.underscore('My Favorite Items')).toBe('my_favorite_items');
  });

  it('capitalize, 首字母大写', () => {
    expect(strings.capitalize('')).toBe('');
    expect(strings.capitalize('innerHTML')).toBe('InnerHTML');
    expect(strings.capitalize('action_name')).toBe('Action_name');
    expect(strings.capitalize('css-class-name')).toBe('Css-class-name');
    expect(strings.capitalize('my favorite items')).toBe('My favorite items');
    expect(strings.capitalize('My Favorite Items')).toBe('My Favorite Items');
  });

  it('levenshtein, 计算字符串编辑距离 (Levenshtein Distance算法) 字符串差异度', () => {
    expect(strings.levenshtein('kitten', 'sitten')).toBe(1);
    expect(strings.levenshtein('sitten', 'sittin')).toBe(1);
    expect(strings.levenshtein('rayl', 'really')).toBe(3);
    expect(strings.levenshtein('pistech', 'pisaas')).toBe(4);
    expect(strings.levenshtein('tang', '')).toBe(4);
    expect(strings.levenshtein('', 'tang')).toBe(4);
  });
});
