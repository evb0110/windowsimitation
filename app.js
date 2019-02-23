const state = {
  count: 0,
  zIndices: {},
  zIndexMax() {
    return Math.max(...Object.values(this.zIndices));
  }
};

const canvas = document.querySelector('.canvas');

const windows = document.createElement('div');
windows.classList.add('windows');
canvas.appendChild(windows);

const panel = document.createElement('div');
panel.classList.add('panel');
canvas.appendChild(panel);

const makeWindowButton = document.createElement('div');
makeWindowButton.classList.add('make-window');
const makeWindowText = document.createTextNode('New Window');
makeWindowButton.appendChild(makeWindowText);
panel.appendChild(makeWindowButton);

makeWindowButton.addEventListener('click', makeNewWindow);

function makeNewWindow() {
  const windowNumber = ++state.count;
  const currentWindow = document.createElement('div');

  currentWindow.classList.add('window');
  currentWindow.style.zIndex = (Math.max(state.zIndexMax(), 0)) + 1;

  state.zIndices[windowNumber] = currentWindow.style.zIndex;

  const windowPanel = document.createElement('div');
  windowPanel.classList.add('window-panel');

  const windowName = document.createElement('div');
  const windowNameText = document.createTextNode(`Window ${windowNumber}`);
  windowName.appendChild(windowNameText);
  windowName.classList.add('window-name');
  windowPanel.appendChild(windowName);

  const minimizeButton = document.createElement('div');
  minimizeButton.classList.add('minimize-button');
  const minimizeText = document.createTextNode('_');
  minimizeButton.appendChild(minimizeText);
  windowPanel.appendChild(minimizeButton);

  const closeButton = document.createElement('div');
  closeButton.classList.add('close-button');
  const closeText = document.createTextNode('x');
  closeButton.appendChild(closeText);
  windowPanel.appendChild(closeButton);

  currentWindow.appendChild(windowPanel);
  windows.appendChild(currentWindow);

  const miniName = document.createElement('div');
  const miniNameText = document.createTextNode(`Window ${windowNumber}`);
  const miniNameSpan = document.createElement('span');
  miniNameSpan.appendChild(miniNameText);
  miniName.appendChild(miniNameSpan);
  miniName.classList.add('mini-name');
  panel.append(miniName);

  // Клик по заголовку в рабочей панели
  miniName.addEventListener('mousedown', () => {

    if (currentWindow.classList.contains('none')) {
      currentWindow.classList.remove('none');
      miniName.classList.remove('dark');
      upWindow();
    } else if (state.zIndices[windowNumber] != state.zIndexMax()) {
      upWindow();
    } else {
      minimizeWindow();
    }
  });

  closeButton.addEventListener('click', closeWindow);
  closeButton.addEventListener('mousedown', (e) => { e.stopPropagation() });
  
  minimizeButton.addEventListener('click', minimizeWindow);
  minimizeButton.addEventListener('mousedown', (e) => { e.stopPropagation() });

  // ===== ПЕРЕТАСКИВАНИЕ =====
  windowPanel.onmousedown = function(event) {
    const offsetX = event.pageX - currentWindow.offsetLeft;
    const offsetY = event.pageY - currentWindow.offsetTop;

    function moveAt(pageX, pageY) {
      currentWindow.style.left = pageX - offsetX + 'px';
      currentWindow.style.top = pageY - offsetY + 'px';
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    document.onmouseup = function() {
      document.removeEventListener('mousemove', onMouseMove);
      windowPanel.onmouseup = null;
    };

    windowPanel.ondragstart = function() {
      return false;
    };
  };
  // ==========================

  // ====== КЛИК ПО ОКНУ ======
  currentWindow.addEventListener('mousedown', handleWindowClick);

  function upWindow() {
    state.zIndices[windowNumber] = currentWindow.style.zIndex = state.zIndexMax() + 1;
  }

  function closeWindow() {
    currentWindow.remove();
    miniName.remove();
    delete state.zIndices[windowNumber];
  }

  function minimizeWindow() {
    currentWindow.classList.add('none');
    miniName.classList.add('dark');
    delete state.zIndices[windowNumber];
  }

  function handleWindowClick() {
    if (state.zIndexMax() == state.zIndices[windowNumber]) return;
    upWindow();
  }
  // ===========================
}
