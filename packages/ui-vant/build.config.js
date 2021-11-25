export const genTypes = false

export const rollup = {
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
