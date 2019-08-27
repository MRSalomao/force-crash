const imgs = [];

let canvasSize = 4000;

const d = document.createElement("div");
d.style.width = "300px";
document.body.appendChild(d);

let cgl = document.createElement("canvas");
let gl = cgl.getContext("webgl");
let tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const createImage = url =>
  new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = url;
  });

let c2 = document.createElement("canvas");
c2.width = c2.height = 1024;
let ctx2 = c2.getContext("2d");

const main = async () => {
  for (let i = 0; i < 100; i++) {
    let c = document.createElement("canvas");
    let ctx = c.getContext("2d");
    d.innerHTML += `${c} `;
    d.innerHTML += `${ctx} `;
    c.width = c.height = canvasSize;
    d.innerHTML += `SIZE SET `;
    ctx.fillStyle = "blue";
    d.innerHTML += `COLOR SET `;
    ctx.fillRect(0, 0, 500, 500);
    d.innerHTML += `DREW RECT `;
    const url = c.toDataURL(); // play with me
    d.innerHTML += `TO DATA URL ${url.length} `;
    let img = await createImage(url); // play with me
    if (!img) {
      canvasSize = 200;
      ctx2.fillStyle = "red";
      ctx2.fillRect(40, 40, 300, 300);
      img = imgs.pop();
      ctx2.drawImage(img, 0, 0);
      // let bigString = new Array(100000).fill(0).join("X");
      // bigString += "wow";
      // console.log(bigString);
      // img = imgs.pop();
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c2);
    }
    // img = null;
    // c = null;
    // ctx = null;
    imgs.push(img); // play with me
    d.innerHTML += `${i} / `;
    // img.style.width = "50px";
    // document.body.appendChild(img); // play with me
    // c.width = c.height = 0; // play with me
  }
};

main();

// OBS:
// 1) WOW, the program hangs EVEN if the image is not saved to the DOM or an array!!
// just passing the DataURL to an image is enough to hold the canvas in memory, even if
// the image is immediately deferenced
// 2) setting the img, canvas, and its context to null explicitly changes nothing
// 3) iOS Safari manifests the bug just like iOS Chrome (makes sense, they both use Webkit)

// but does NOT crash. How to make it CRASH (not "just" HANG)?
// ideas to explore (maybe create crashTest1,2,3,4... for each attempt for easy testing):
// 1) When it hangs, the current canvas/images in memory can't be used anymore.
// When these are passed to texImage2d or drawImage, a CRASH happens, following the HANGING
// 2) When it hangs, trying to allocate another big chunk of memory, like a big string crashes it
// 3) When it hangs, trying to create a new canvas crashes it
// 4) When it hangs, trying to attach an image/canvas to the DOM crashes it
// 5) When it hangs, trying to manipulate an existing canvas crashes it
// 5) When it hangs, trying to call toDataURL again crashes it
// 6) When it hangs, it crashes only if the memory pressure was already high enough
// 7) When it hangs, it crashes only if there's a big enough number of referenced canvas/glcanvas/images
// 8) When it hangs, it crashes if there's a big enough chunk of allocated webgl memory
// 9) When it hangs, it crashes if there's enough 2d/gl canvas leftover garbage from the previous tab

// results:
// 1) calling drawImage after hanging, by itself, does not crash it
// 1) calling texImage2D did crash it once, but with low frequency
// (increasing the input img/canvas size didn't increase crash likelihood)
// 2) allocating a 200000 char string does not crash it
// 3,5) creating more canvases and calling toDataURL does not crash it, but it can lead
//   to ctx=null on sufficiently large canvases/urls
// 4) drawing more on the previous canvas does not crash it.
//   drawing on a previous canvas created at the very beggining does not crash it.
