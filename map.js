document.addEventListener('DOMContentLoaded', () => {
    const mapPool = document.getElementById('mapPool');
    const mapContent = document.getElementById('mapContent');
    const rootNode = document.getElementById('rootNode');
  
    if (!mapPool || !mapContent || !rootNode) return;
  
    let isPanning = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;
    let scale = 1;
  
    // Функция обновления трансформации
    function updateTransform() {
      mapContent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
  
    // Центрирование корневого узла в видимой области:
    // Получаем размеры пула
    const poolRect = mapPool.getBoundingClientRect();
    // Задаем вертикальный отступ (например, 50px от верхнего края)
    const desiredY = 50;
    // Горизонтально центрируем корневой узел: вычисляем нужную позицию так, чтобы центр узла совпал с центром пула
    const desiredX = poolRect.width / 2 - rootNode.offsetWidth / 2;
    // Вычисляем смещения: нужно сместить виртуальный холст так, чтобы корневой узел оказался на (desiredX, desiredY)
    translateX = desiredX - rootNode.offsetLeft;
    translateY = desiredY - rootNode.offsetTop;
    updateTransform();
  
    // --- Мышиное управление ---
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
  
    mapPool.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomIntensity = 0.1;
      if (e.deltaY < 0) {
        scale *= (1 + zoomIntensity);
      } else {
        scale /= (1 + zoomIntensity);
      }
      updateTransform();
    });
  
    // --- Поддержка сенсорных событий (touch) ---
    let isPinching = false;
    let lastTouchDistance = null;
  
    mapPool.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isPanning = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        isPinching = true;
        lastTouchDistance = getTouchDistance(e.touches[0], e.touches[1]);
      }
    });
  
    mapPool.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (isPanning && e.touches.length === 1) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        translateX += dx;
        translateY += dy;
        updateTransform();
      } else if (isPinching && e.touches.length === 2) {
        const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
        scale = scale * (currentDistance / lastTouchDistance);
        lastTouchDistance = currentDistance;
        updateTransform();
      }
    }, { passive: false });
  
    mapPool.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        isPanning = false;
        isPinching = false;
        lastTouchDistance = null;
      } else if (e.touches.length === 1) {
        isPinching = false;
        isPanning = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    });
  
    function getTouchDistance(touch1, touch2) {
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
  });
  