interface Options {
  container?: HTMLElement,
  content?: string,
  width?: number,
  height?: number,
  opacity?: number,
  color?: string,
  fontSize?: number,
  rotate?: number,
  zIndex?: number,
}

class Watermark {
  mo: any;
  constructor({
    container = document.body, // 父容器
    content = 'water mark', // 水印内容
    width = 300, // svg宽
    height = 200, // svg高
    opacity = 0.15, // 透明度
    color = '#999', // 字体颜色
    fontSize = 14, // 字体大小
    rotate = 15, // 旋转度
    zIndex = 999999999 // 层级
  }: Options = {}) {
    const args = arguments[0];
    const svgStr = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${height}px">
        ${content.split('\n').map((item, index) => (
          `
            <text
              x="50%"
              y="${20 + index * 20}"
              text-anchor="middle"
              fill="${color}"
              fill-opacity="${opacity}"
              transform="rotate(${rotate}, 0, 0)"
              style="font-size: ${fontSize}px;">${item}</text>
          `
      ))}
      </svg>`;
    const base64Url = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgStr)))}`;
    const __wm = document.querySelector('.__wm');

    const watermarkDiv = __wm || document.createElement('div');
    const styleStr = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: ${zIndex};
      pointer-events: none;
      background-repeat: repeat;
      background-image: url('${base64Url}')`;

    watermarkDiv.setAttribute('style', styleStr);
    watermarkDiv.classList.add('__wm');

    if (!__wm) {
      container.style.position = 'relative';
      container.insertBefore(watermarkDiv, container.firstChild);
    }

    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    if (MutationObserver && !this.mo) {
      this.mo = new MutationObserver(() => {
        const __wm = document.querySelector('.__wm');
        // 只在__wm元素变动才重新调用 __watermark
        if ((__wm && __wm.getAttribute('style') !== styleStr) || !__wm) {
          // 避免一直触发
          this.mo.disconnect();
          this.mo = null;
          new Watermark(JSON.parse(JSON.stringify(args)));
        }
      });

      this.mo.observe(container, {
        attributes: true,
        subtree: true,
        childList: true
      })
    }
  }
  unload() {
    this.mo && this.mo.disconnect()
    this.mo = null
  }
}

export default Watermark;