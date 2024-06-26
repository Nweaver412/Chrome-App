let cursor;
let isCollaborating = false;

function setupListeners() {
  document.addEventListener('mousemove', (e) => {
    if (isCollaborating) {
      chrome.runtime.sendMessage({
        type: 'send',
        data: {
          type: 'mousemove',
          x: e.clientX,
          y: e.clientY
        }
      });
    }
  });
  
  document.addEventListener('click', (e) => {
    if (isCollaborating) {
      chrome.runtime.sendMessage({
        type: 'send',
        data: {
          type: 'click',
          x: e.clientX,
          y: e.clientY
        }
      });
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'update') {
    updateCursor(request.data);
  } else if (request.type === 'toggleCollaboration') {
    isCollaborating = request.isCollaborating;
    if (isCollaborating && !cursor) {
      createCursor();
    } else if (!isCollaborating && cursor) {
      removeCursor();
    }
  }
});

function createCursor() {
  cursor = document.createElement('div');
  cursor.style.position = 'fixed';
  cursor.style.width = '10px';
  cursor.style.height = '10px';
  cursor.style.borderRadius = '50%';
  cursor.style.backgroundColor = 'red';
  cursor.style.pointerEvents = 'none';
  cursor.style.zIndex = '9999';
  document.body.appendChild(cursor);
}

function removeCursor() {
  if (cursor && cursor.parentNode) {
    cursor.parentNode.removeChild(cursor);
  }
  cursor = null;
}

function updateCursor(data) {
  if (!cursor) {
    createCursor();
  }
  
  if (data.type === 'mousemove') {
    cursor.style.left = data.x + 'px';
    cursor.style.top = data.y + 'px';
  } else if (data.type === 'click') {
    cursor.style.transform = 'scale(1.5)';
    setTimeout(() => {
      cursor.style.transform = 'scale(1)';
    }, 100);
  }
}

setupListeners();