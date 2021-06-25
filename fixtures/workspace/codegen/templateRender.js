const ejs = require('ejs');
const prettier = require('prettier');
const path = require('path');

module.exports = (tmpl, model) => {
  const text = ejs.render(tmpl.content, model);

  const extName = path.extname(tmpl.relativePath);

  let content = text;

  const format = {
    printWidth: 120,
    tabWidth: 2,
    parser: 'vue',
    trailingComma: 'none',
    jsxBracketSameLine: false,
    semi: true,
    singleQuote: true,
  };

  switch (extName) {
    case '.ts':
      format.parser = 'typescript';
      break;
  }

  content = prettier.format(text, format);

  return {
    name: tmpl.relativePath,
    content,
  };
};
