const cowsay = require('./cowsay');

module.exports = () => {
  return {
    description: 'tang cowsay 插件',
    contact: {
      name: 'rayl',
      email: 'rayl@pisaas.com',
    },
    actions: {
      say: cowsay.say,
      think: cowsay.think,
    },
  };
};
