package main

import (
	"log"
	"net/http"
	"sync"
	"time"
	"html/template"
	"github.com/gorilla/websocket"
)

type Message struct {
	Text string
	Time  string
}

type Data struct {
	Messages []Message
}

var (
	messages []Message
	clients  = make(map[*websocket.Conn]bool)
	clientsMux sync.Mutex
	upgrader  = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true 
		},
	}
)

func broadcastMessages(msg Message) {
	clientsMux.Lock()
	defer clientsMux.Unlock()

	for client := range clients {
		err := client.WriteJSON(msg)
		if err != nil {
			log.Printf("Error sending message to client: %v", err)
			client.Close()
			delete(clients, client)
		}
	}
}

func websocketHandler(write http.ResponseWriter, request *http.Request) {
	conn, err := upgrader.Upgrade(write, request, nil)
	if err != nil {
		log.Printf("Upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	clientsMux.Lock()
	clients[conn] = true
	clientsMux.Unlock()

	
	for _, msg := range messages {
		err := conn.WriteJSON(msg)
		if err != nil {
			log.Printf("Error sending message to client: %v", err)
			conn.Close()
			clientsMux.Lock()
			delete(clients, conn)
			clientsMux.Unlock()
			return
		}
	}

	
	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			
			clientsMux.Lock()
			delete(clients, conn)
			clientsMux.Unlock()
			return
		}

		msg.Time = time.Now().Format("15:04:05")
		messages = append(messages, msg)
		log.Printf("Received message: %s", msg.Text)
		broadcastMessages(msg)
	}
}

func main() {
	port := ":3000"
	html_tmpl := template.Must(template.ParseFiles("index.html"))

	http.HandleFunc("/", func(write http.ResponseWriter, request *http.Request) {
		if request.Method == http.MethodPost {
			request.ParseForm()
			msgText := request.FormValue("msg")
			if msgText != "" {
				msg := Message{
					Text: msgText,
					Time: time.Now().Format("15:04:05"),
				}
				messages = append(messages, msg)
				log.Printf("Received message: %s", msgText)
				broadcastMessages(msg)
			}
		}

		data := Data{
			Messages: messages,
		}

		html_tmpl.Execute(write, data)
	})

	http.HandleFunc("/ws", websocketHandler)

	log.Printf("Listening on port %s", port)
	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("Error starting server: ", err)
	}
}

