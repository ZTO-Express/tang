const ejs = require('ejs');
const prettier = require('prettier');

module.exports = (tmpl, model) => {
  const text = ejs.render(tmpl.content, model);

  const extName = path.extname(tmpl.relativePath);

  let content = text;

  let _format = {
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
      _format = Object.assign({}, format, { parser: 'typescript' });
      break;
  }

  content = prettier.format(text, _format);

  return {
    name: tmpl.relativePath,
    content,
  };
};
