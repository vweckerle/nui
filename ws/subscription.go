package ws

const STRING = "string"
const JSON = "json"
const BINARY = "binary"

type Message struct {
	Subject  string   `json:"subject"`
	Payload  []byte   `json:"Payload"`
	Metadata Metadata `json:"metadata"`
}

type Metadata struct {
}

type Request struct {
	ConnectionId string   `json:"connection_id"`
	Subjects     []string `json:"subjects"`
}
