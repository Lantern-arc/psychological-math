document.addEventListener('DOMContentLoaded', () => {
    const mapPool = document.getElementById('mapPool');
    const mapContent = document.getElementById('mapContent');
    if (!mapPool || !mapContent) return;
  
    // Переменные для панорамирования и масштабирования
    let isPanning = false;    // флаг панорамирования (мышь/один палец)
    let isPinching = false;   // флаг pinch (два пальца)
    let startX = 0, startY = 0;   // для отслеживания смещения при панорамировании
    let translateX = 0, translateY = 0; // текущее смещение
    let scale = 1;                 // текущий масштаб
    let lastTouchDistance = 0;     // расстояние между пальцами при pinch
  
    /**
     * Применяет текущие translateX, translateY и scale к #mapContent.
     */
    function updateTransform() {
      mapContent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
    
    const rootNode = document.getElementById('rootNode');
    if (rootNode) {
      // Например, хотим, чтобы rootNode был по центру экрана, 50px от верха
      const poolRect = mapPool.getBoundingClientRect();
      const desiredX = poolRect.width / 2 - rootNode.offsetWidth / 2; // по центру
      const desiredY = 50; // 50px от верхнего края
  
      // Текущее положение rootNode в #mapContent (его offsetLeft/offsetTop)
      const currentNodeX = rootNode.offsetLeft;
      const currentNodeY = rootNode.offsetTop;
  
      // Считаем, насколько нужно сдвинуть
      translateX = desiredX - currentNodeX;
      translateY = desiredY - currentNodeY;
      updateTransform();
    }
   
  
    // ------------------------------------------------------
    //                ПАНОРАМИРОВАНИЕ МЫШЬЮ
    // ------------------------------------------------------
    mapPool.addEventListener('mousedown', (e) => {
      isPanning = true;
      startX = e.clientX;
      startY = e.clientY;
    });
  
    document.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = e.clientX;
      startY = e.clientY;
      translateX += dx;
      translateY += dy;
      updateTransform();
    });
  
    document.addEventListener('mouseup', () => {
      isPanning = false;
    });
  
    // ------------------------------------------------------
    //                ЗУМ КОЛЕСИКОМ ВОКРУГ КУРСОРА
    // ------------------------------------------------------
    mapPool.addEventListener('wheel', (e) => {
      e.preventDefault(); // чтобы страница не скроллилась
      // Коэффициент изменения масштаба
      const zoomIntensity = 0.1;
      // Если колесо прокрутить «вверх» (deltaY < 0) - увеличиваем, иначе уменьшаем
      const factor = e.deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
  
      // Координаты курсора внутри mapPool (в пикселях)
      const rect = mapPool.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
  
      // Переводим координаты курсора в «координаты карты» (до масштабирования)
      const containerX = (mouseX - translateX) / scale;
      const containerY = (mouseY - translateY) / scale;
  
      // Применяем новый масштаб
      scale *= factor;
  
      // Сдвигаем карту так, чтобы (containerX, containerY) остался под (mouseX, mouseY)
      translateX = mouseX - containerX * scale;
      translateY = mouseY - containerY * scale;
  
      updateTransform();
    });
  
    // ------------------------------------------------------
    //                СЕНСОРНЫЕ СОБЫТИЯ (TOUCH)
    // ------------------------------------------------------
    mapPool.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        // Один палец -> панорамирование
        isPanning = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        // Два пальца -> pinch
        isPinching = true;
        lastTouchDistance = getTouchDistance(e.touches[0], e.touches[1]);
      }
    });
  
    mapPool.addEventListener('touchmove', (e) => {
      e.preventDefault(); // отключаем стандартную прокрутку страницы
      if (isPanning && e.touches.length === 1) {
        // Панорамирование одним пальцем
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        translateX += dx;
        translateY += dy;
        updateTransform();
      } else if (isPinching && e.touches.length === 2) {
        // Pinch-to-zoom
        const newDistance = getTouchDistance(e.touches[0], e.touches[1]);
        const factor = newDistance / lastTouchDistance;
  
        // Координаты центра pinch (средняя точка между двумя пальцами) в экранных координатах
        const pinchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const pinchCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
  
        // Переводим pinch-центр в «координаты карты» (до масштабирования)
        const containerX = (pinchCenterX - translateX) / scale;
        const containerY = (pinchCenterY - translateY) / scale;
  
        // Обновляем масштаб
        scale *= factor;
        lastTouchDistance = newDistance;
  
        // Сдвигаем карту так, чтобы pinch-центр остался под пальцами
        translateX = pinchCenterX - containerX * scale;
        translateY = pinchCenterY - containerY * scale;
  
        updateTransform();
      }
    }, { passive: false });
  
    mapPool.addEventListener('touchend', (e) => {
      // Если все пальцы убраны
      if (e.touches.length === 0) {
        isPanning = false;
        isPinching = false;
        lastTouchDistance = 0;
      }
      // Если остался один палец, продолжаем панорамирование
      else if (e.touches.length === 1) {
        isPinching = false;
        isPanning = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    });
  
    /**
     * Вычисляет расстояние между двумя точками касания (touch1, touch2).
     */
    function getTouchDistance(touch1, touch2) {
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
  });
  