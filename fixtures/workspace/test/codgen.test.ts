import * as execa from 'execa';
// import * as path from 'path';

describe('workspace：代码生成调试', () => {
  const origCwd = process.cwd;

  afterEach(() => {
    process.cwd = origCwd;
  });

  it('generate', async () => {
    // process.cwd = () => {
    //   return path.join(__dirname, '../views/demo');
    // };
    // 执行代码生成
    // const res = await execa('tang', ['gen', '.', '--inspect']);
    // expect(res.stdout).toMatch('当前文件编译选项');
    // 执行代码生成 (如何设置process变量)
    // await execa('tang', ['gen', './views/demo']);
    // await execa('tang', ['gen', '.', '--preset=api']);
    // await execa('tang', ['gen', '.', '--preset=json']);
  });
});
