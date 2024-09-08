const socket = io();
let selectedUser = '';

document.getElementById('register-btn').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    socket.emit('register', username, (response) => {
        if (response.success) {
            document.getElementById('user-section').style.display = 'none';
            document.getElementById('chat-section').style.display = 'block';
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
        userDiv.onclick = () => startChat(user);
        onlineUsersDiv.appendChild(userDiv);
    });
}

function startChat(user) {
    selectedUser = user;
    document.getElementById('chat-with-user').textContent = `Chatting with: ${user}`;
    socket.emit('get messages', user);
    document.getElementById('messages').innerHTML = '';
    document.getElementById('chat-section').style.display = 'block';
}

socket.on('update messages', (messages) => {
    const messagesDiv = document.getElementById('messages');
    messages.forEach(msg => {
        displayMessage(msg, 'received');
    });
});

document.getElementById('message-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (message && message.trim()) {
        socket.emit('send message', selectedUser, message);
        displayMessage({ from: 'You', message: message, time: new Date().toLocaleTimeString() }, 'sent');
        messageInput.value = '';
    }
});

document.getElementById('send-file-btn').addEventListener('click', function() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileData = {
                name: file.name,
                type: file.type,
                data: e.target.result
            };
            socket.emit('send file', fileData);
        };
        reader.readAsDataURL(file);
    }
});

socket.on('new message', function(data) {
    displayMessage(data, 'received');
});

socket.on('new file', function(file) {
    displayFile(file);
});

function displayMessage(data, type) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    messageDiv.dataset.from = data.from;
    messageDiv.dataset.time = data.time;
    messageDiv.innerHTML = `${data.from} (${data.time}): ${data.message}
        <button  onclick="deleteMessage(event)">Delete</button>
        <button  onclick="editMessage(event)">Edit</button>`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function displayFile(file) {
    const messagesDiv = document.getElementById('messages');
    const fileDiv = document.createElement('div');
    fileDiv.classList.add('message', 'received');
    fileDiv.innerHTML = `<a href="${file.data}" download="${file.name}">${file.name}</a>`;
    messagesDiv.appendChild(fileDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function deleteMessage(event) {
    const messageDiv = event.target.parentElement;
    if (confirm("Are you sure you want to delete this message?")) {
        messageDiv.remove();
    }
}

function editMessage(event) {
    const messageDiv = event.target.parentElement;
    const messageText = prompt("Edit your message:", messageDiv.textContent);
    if (messageText !== null) {
        messageDiv.querySelector('.message-text').textContent = messageText;
    }
}

socket.on('typing', function(username) {
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.textContent = `${username} is typing...`;
    typingIndicator.style.display = 'block';

    // Clear typing indicator after 3 seconds
    setTimeout(() => {
        typingIndicator.style.display = 'none';
    }, 3000);
});

document.getElementById('message-input').addEventListener('input', function() {
    socket.emit('typing', selectedUser);
});

document.getElementById('back-btn').addEventListener('click', function() {
    document.getElementById('chat-section').style.display = 'none';
    document.getElementById('user-section').style.display = 'block';
    document.getElementById('messages').innerHTML = '';
    selectedUser = '';
    document.getElementById('typing-indicator').style.display = 'none';
});

document.getElementById('update-profile-btn').addEventListener('click', function() {
    const profilePicInput = document.getElementById('profile-pic-input');
    const profilePic = profilePicInput.files[0];

    if (profilePic) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const profileData = {
                image: e.target.result,
                name: profilePic.name
            };
            socket.emit('update profile', profileData);
        };
        reader.readAsDataURL(profilePic);
    }
});
