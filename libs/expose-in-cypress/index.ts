export const exposeInCypress = (whatToExpose, force = false) => {
    console.log(whatToExpose.constructor.name);
    // @ts-ignore
    if (window.Cypress || force) {
      // @ts-ignore
      window[whatToExpose.constructor.name] = whatToExpose;
    }
}
