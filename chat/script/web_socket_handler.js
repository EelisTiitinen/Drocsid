let socket;

function startChat() {
    socket = new WebSocket('ws://' + window.location.host + '/ws');

    socket.onopen = function() {
        console.log("Connected to WebSocket server");
    };

    socket.onmessage = function(event) {
        const msg = JSON.parse(event.data);
        if (msg.Text !== "") {
            const messageElement = document.createElement('div');
            messageElement.id = 'message';
		const messageTime = document.createElement('p');
			messageTime.textContent = `${msg.Time}`;
			messageTime.id = 'time';

			const messageUser = document.createElement('p');
			messageUser.textContent = `${msg.Name}`;
			messageUser.id = 'username';

			const nameTimeDiv = document.createElement('div');
			nameTimeDiv.id = 'name-time';

			nameTimeDiv.appendChild(messageUser);
			nameTimeDiv.appendChild(messageTime);
			
			messageElement.appendChild(nameTimeDiv);

			if (msg.Text.indexOf(".jpg") != -1 || msg.Text.indexOf(".png") != -1 || msg.Text.indexOf(".gif") != -1) {
				const messageImage = document.createElement('img');
				messageImage.src = `${msg.Text}`;
				messageImage.id = 'image';
				messageElement.appendChild(messageImage);
			}
			else {
				const messageText = document.createElement('p');
				messageText.textContent = `${msg.Text}`;
				messageText.id = 'text';
				messageElement.appendChild(messageText);
			}

			

            const msgContainer = document.getElementById("messages");
			msgContainer.appendChild(messageElement);

			msgContainer.scrollTop = msgContainer.scrollHeight;
        }
    };

    socket.onerror = function(error) {
        console.log("WebSocket Error: " + error);
    };

    socket.onclose = function() {
        console.log("Disconnected from WebSocket server");
    };
}

function sendMessage(event) {
    event.preventDefault();
    const messageInput = document.getElementById("message-text");
    const msg = messageInput.value;
    if (msg) {
        socket.send(JSON.stringify({ Text: msg }));
        messageInput.value = '';
    }
}

window.onload = startChat;
