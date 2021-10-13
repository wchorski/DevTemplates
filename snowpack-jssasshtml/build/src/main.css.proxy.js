// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = "#mouse-follow {\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  padding: 55px;\n  background: red;\n  animation: 1s ease infinite pulse;\n}\n\n@keyframes pulse {\n  0% {\n    transform: scale(1);\n  }\n  25% {\n    transform: scale(1.1);\n  }\n  50% {\n    transform: scale(1);\n  }\n}\nhtml {\n  background: #0e3741;\n}\n\nh1 {\n  color: whitesmoke;\n}";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}