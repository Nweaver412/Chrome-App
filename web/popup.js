let isConnected = false;
let isCollaborating = false;

document.getElementById('connectBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'connect'}, (response) => {
    if (response.status === 'connecting' || response.status === 'connected') {
      isConnected = true;
      updateStatus();
    }
  });
});

document.getElementById('disconnectBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'disconnect'}, (response) => {
    if (response.status === 'disconnected') {
      isConnected = false;
      isCollaborating = false;
      updateStatus();
    }
  });
});

document.getElementById('toggleCollabBtn').addEventListener('click', () => {
  if (isConnected) {
    isCollaborating = !isCollaborating;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'toggleCollaboration', isCollaborating});
    });
    updateStatus();
  }
});

function updateStatus() {
  const statusElement = document.getElementById('status');
  if (isConnected) {
    statusElement.className = 'status-connected';
    statusElement.textContent = `Status: Connected${isCollaborating ? ' (Collaborating)' : ''}`;
  } else {
    statusElement.className = 'status-disconnected';
    statusElement.textContent = 'Status: Disconnected';
  }
}

// Initialize status on popup open
chrome.runtime.sendMessage({type: 'getStatus'}, (response) => {
  isConnected = response.isConnected;
  isCollaborating = response.isCollaborating;
  updateStatus();
});
