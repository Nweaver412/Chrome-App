let socket;
let isConnected = false;
let isCollaborating = false;

function connectWebSocket() {
  socket = new WebSocket('ws://localhost:8080/ws');
  
  socket.onopen = () => {
    console.log('WebSocket connected');
    isConnected = true;
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {type: 'update', data: data});
        }
      });
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    isConnected = false;
  };
  
  socket.onclose = (event) => {
    console.log('WebSocket closed. Attempting to reconnect in 5 seconds...');
    isConnected = false;
    setTimeout(connectWebSocket, 5000);
  };
}

function disconnectWebSocket() {
  if (socket) {
    socket.close();
  }
  isConnected = false;
  isCollaborating = false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'connect') {
    if (!isConnected) {
      connectWebSocket();
    }
    sendResponse({status: 'connecting'});
    return true;
  } else if (request.type === 'disconnect') {
    disconnectWebSocket();
    sendResponse({status: 'disconnected'});
    return true;
  } else if (request.type === 'send' && isConnected && isCollaborating) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(request.data));
      sendResponse({status: 'sent'});
    } else {
      sendResponse({status: 'not_connected'});
    }
    return true;
  } else if (request.type === 'getStatus') {
    sendResponse({isConnected, isCollaborating});
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});