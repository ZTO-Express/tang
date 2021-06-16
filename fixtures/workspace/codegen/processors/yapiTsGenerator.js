/**
 * yapi typescript调用接口生成器
 */
module.exports.yapiTsGenerator = (config = {}) => {
  return {
    name: 'yapi-ts',

    async generate(document) {
      return document;
    },
  };
};
