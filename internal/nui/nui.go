package nui

import (
	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/internal/ws"
	"github.com/nats-nui/nui/pkg/clicontext"
	"github.com/nats-nui/nui/pkg/logging"
	docstore "github.com/nats-nui/nui/pkg/storage"
)

type Nui struct {
	ConnRepo        connection.ConnRepo
	ConnPool        connection.Pool[*connection.NatsConn]
	CliConnImporter clicontext.Importer[clicontext.ImportedContextEntry]
	Hub             ws.IHub
	l               logging.Slogger
}

func Setup(dbPath string, logger logging.Slogger) (*Nui, error) {
	n := &Nui{}
	store, err := docstore.NewDocStore(dbPath)
	if err != nil {
		return nil, err
	}
	n.ConnRepo = connection.NewDocStoreConnRepo(store)
	n.ConnPool = connection.NewNatsConnPool(n.ConnRepo)
	n.Hub = ws.NewNatsHub(n.ConnPool, logger)
	n.l = logger
	return n, nil
}
