let socket;

       function startChat() {
            socket = new WebSocket('ws://' + window.location.host + '/ws');

            socket.onopen = function() {
                console.log("Connected to WebSocket server");
            };

            socket.onmessage = function(event) {
                const msg = JSON.parse(event.data);
                if (msg.Text !== "") {
                    const messageElement = document.createElement('p');
					messageElement.id = 'message';
                    messageElement.textContent = `${msg.Time}: ${msg.Name}: ${msg.Text}`;
                    document.getElementById("messages").appendChild(messageElement);
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

