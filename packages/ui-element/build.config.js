export const genTypes = false

export const rollup = {
  internal: ['vue', '@element-plus/icons', 'element-plus'],
  plugins: {
    vue: {
      preprocessOptions: {
        scss: {
          additionalData: `
            @use "sass:math";
            @import "./src/styles/theme.scss";
          `
        }
      }
    }
  }
}
