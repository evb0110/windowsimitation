const state = {
  // state включает в себя

  count: 0,
  // счётчик создания нового окна,

  zIndices: {},
  // объект, в котором записаны значения z-index окна;
  // в качестве ключей используются номера окон

  get zIndexMax() {
    // возвращает максимальное значение z-index в данный
    // момент времени или ноль, если активных окон нет
    return Math.max(...Object.values(this.zIndices), 0);
  },
};

const canvas = document.querySelector('.canvas');
// Элемент DOM, внутри которого решена задача.
// Согласно дополнительному условию, он занимает
// всю видимую область окна браузера

const windows = document.createElement('div');
// Вся часть канваса за исключением рабочей
// панели снизу
windows.classList.add('windows');
canvas.appendChild(windows);

const panel = document.createElement('div');
// Собственно рабочая панель, располагающаяся
// внизу экрана
panel.classList.add('panel');
canvas.appendChild(panel);

const makeWindowButton = document.createElement('div');
// Кнопка создания нового окна, расположена в левой
// части рабочей панели
makeWindowButton.classList.add('make-window');
const makeWindowText = document.createTextNode('New Window');
makeWindowButton.appendChild(makeWindowText);
panel.appendChild(makeWindowButton);
makeWindowButton.addEventListener('click', makeNewWindow);

function makeNewWindow() {
  const windowNumber = ++state.count;
  // Номер окна, от которого будут зависеть
  // данные, связанные с этим окном

  const currentWindow = document.createElement('div');
  // Собственно окно

  currentWindow.classList.add('window');
  currentWindow.style.zIndex = state.zIndexMax + 1;
  // Новое окно должно оказаться над всеми остальными

  state.zIndices[windowNumber] = currentWindow.style.zIndex;
  // z-index текущего окна записывается в глобальный объект

  const windowPanel = document.createElement('div');
  // Рабочая панель внизу экрана
  windowPanel.classList.add('window-panel');

  const windowName = document.createElement('div');
  // Заголовок вверху каждого окна, содержащий его номер
  const windowNameText = document.createTextNode(`Window ${windowNumber}`);
  windowName.appendChild(windowNameText);
  windowName.classList.add('window-name');
  windowPanel.appendChild(windowName);

  const minimizeButton = document.createElement('div');
  // Кнопка сворачивания окна, справа на заголовке,
  // левее кнопки закрытия окна
  minimizeButton.classList.add('minimize-button');
  const minimizeText = document.createTextNode('_');
  minimizeButton.appendChild(minimizeText);
  windowPanel.appendChild(minimizeButton);

  const closeButton = document.createElement('div');
  // Кнопка закрытия окна, в правом углу заголовка
  closeButton.classList.add('close-button');
  const closeText = document.createTextNode('x');
  closeButton.appendChild(closeText);
  windowPanel.appendChild(closeButton);

  currentWindow.appendChild(windowPanel);
  windows.appendChild(currentWindow);

  const miniName = document.createElement('div');
  // Заголовок окна на рабочей панели внизу экрана,
  // содержит название окна, включающее порядковый
  // номер его создания
  const miniNameText = document.createTextNode(`Window ${windowNumber}`);
  const miniNameSpan = document.createElement('span');
  miniNameSpan.appendChild(miniNameText);
  miniName.appendChild(miniNameSpan);
  miniName.classList.add('mini-name');
  panel.append(miniName);

  miniName.addEventListener('mousedown', () => {
    // Событие mousedown по заголовку в рабочей панели

    if (currentWindow.classList.contains('none')) {
      // Если окно свёрнуто,
      currentWindow.classList.remove('none');
      // развернуть его,
      miniName.classList.remove('dark');
      // изменить цвет заголовка в рабочей панели,
      upWindow();
      // поместить окно поверх всех остальных
    } else if (state.zIndices[windowNumber] != state.zIndexMax) {
      // В условии НАМЕРЕННО использовано нестрогое
      // сравнение, т.к. z-index может быть и числом, и строкой.
      // Если окно не свёрнуто и не верхнее,
      upWindow();
      // поместить его поверх других окон
    } else {
      // Если окно верхнее,
      minimizeWindow();
      // минимизировать его
    }
  });

  closeButton.addEventListener('click', closeWindow);
  // При клике по кнопке закрытия окна, запустить обработчик этого события

  closeButton.addEventListener('mousedown', e => {
    e.stopPropagation();
  });
  // При mousedown по кнопке закрытия окна блокировать прочие события,
  // сделано для блокировки выведения окна на передний план

  minimizeButton.addEventListener('click', minimizeWindow);
  // При клике по кнопке сворачивания окна, запустить обработчик этого события

  minimizeButton.addEventListener('mousedown', e => {
    e.stopPropagation();
  });
  // При mousedown по кнопке сворачивания окна блокировать выведение окна на
  // передний план

  // ===== ПЕРЕТАСКИВАНИЕ =====
  windowPanel.onmousedown = function(event) {
    const offsetX = event.pageX - currentWindow.offsetLeft;
    const offsetY = event.pageY - currentWindow.offsetTop;
    // Вычисляем положение мыши относительно левого верхнего
    // угла текущего окна



    document.addEventListener('mousemove', onMouseMove);
    // Вызыв обработчика движения мыши

    document.onmouseup = function() {
      // Утилизация listener'a движения мыши при завершении клика
      document.removeEventListener('mousemove', onMouseMove);
      windowPanel.onmouseup = null;
    };

    windowPanel.ondragstart = function() {
      // Чтобы окно не прилипало к мыши
      return false;
    };

    function moveAt(pageX, pageY) {
      // Движение окна параллельно движению мыши
      currentWindow.style.left = pageX - offsetX + 'px';
      currentWindow.style.top = pageY - offsetY + 'px';
    }

    function onMouseMove(event) {
      // Обработчик движения мыши
      moveAt(event.pageX, event.pageY);
    }
  };
  // === КОНЕЦ ПЕРЕТАСКИВАНИЯ ======

  currentWindow.addEventListener('mousedown', handleWindowClick);
  // Вызов обработчика mousedown для окна

  function upWindow() {
    // Текущее окно на передний план + запись его z-index в объект
    state.zIndices[windowNumber] = currentWindow.style.zIndex =
      state.zIndexMax + 1;
  }

  function closeWindow() {
    // При закрытии окна 
    currentWindow.remove();
    miniName.remove();
    // удаляется его заголовок в рабочей панели
    delete state.zIndices[windowNumber];
    // и его z-index удаляется из глобального объекта
  }

  function minimizeWindow() {
    // При минимизации окна
    currentWindow.classList.add('none');
    miniName.classList.add('dark');
    // меняется цвет его заголовка в рабочей панели
    delete state.zIndices[windowNumber];
    // и его z-index удаляется из глобального объекта
  }

  function handleWindowClick() {
    // При клике по окну
    if (state.zIndexMax == state.zIndices[windowNumber]) return;
    // проверяется, верхнее ли оно (НАМЕРЕННО нестрогое сравнение)
    upWindow();
    // и в этом случае оно выводится на передний план
  }
}
