const mouseFollow = document.getElementById('mouse-follow');

document.addEventListener('mousemove', (e) => {
  mouseFollow.style.cssText = `
    left: ${e.clientX - 25}px;
    top:  ${e.clientY - 25}px;
  `;
});