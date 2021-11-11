export const rollup = {
  plugins: {
    vue: {
      preprocessOptions: {
        scss: {
          additionalData: `
            @use "sass:math";
            @import "${__dirname}/src/styles/theme.scss";
          `
        }
      }
    }
  }
}
