/**
*
* @returns {{ x: number, y: number }}
*/
function getCenter(scene) {
  return {
    x: scene.scale.width / 2,
    y: scene.scale.height / 2
  };
}
