const socket = io();
let selectedUser = '';

document.getElementById('register-btn').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    socket.emit('register', username, (response) => {
        if (response.success) {
            document.getElementById('user-section').style.display = 'none';
            document.getElementById('chat-section').classList.toggle('hide');
            document.getElementById('segni').classList.toggle('hide');
            // Display online users
            updateOnlineUsers(response.users);
        } else {
            alert(response.message);
        }
    });
});

socket.on('update user list', (users) => {
    updateOnlineUsers(users);
});

function updateOnlineUsers(users) {
    const onlineUsersDiv = document.getElementById('online-users');
    onlineUsersDiv.innerHTML = '';
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.textContent = user;
        userDiv.onclick = () => startChat(user); // Start a chat when a user is clicked
        onlineUsersDiv.appendChild(userDiv);
    });
}

function startChat(user) {
    selectedUser = user;
    document.getElementById('chat-with-user').textContent = `Chatting with: ${user}`;
    socket.emit('get messages', user);
    document.getElementById('messages').innerHTML = ''; // Clear messages for new chat
    document.getElementById('chat-section').style.display = 'block';
}

socket.on('update messages', (messages) => {
    const messagesDiv = document.getElementById('messages');
    messages.forEach(msg => {
        displayMessage(msg);
    });
});

document.getElementById('message-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (message && message.trim()) {
        socket.emit('send message', selectedUser, message);
        messageInput.value = ''; // Clear input after sending
    }
});

// Listen for new messages
socket.on('new message', function(data) {
    displayMessage(data);
});

// Display message in chat area
function displayMessage(data) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${data.from} (${data.time}): ${data.message}`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
}

// Back button to select another user
document.getElementById('back-btn').addEventListener('click', function() {
    document.getElementById('chat-section').style.display = 'none';
    document.getElementById('user-section').style.display = 'block'; // Show user section again
    document.getElementById('messages').innerHTML = ''; // Clear messages
    selectedUser = ''; // Reset selected user
});