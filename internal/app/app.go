package app

import (
	"context"
	"errors"
	"github.com/pricelessrabbit/nui/internal/nui"
	"github.com/pricelessrabbit/nui/pkg/logging"
	"os"
)

// App struct
type App struct {
	ctx        context.Context
	target     Target
	l          logging.Slogger
	dbPath     string
	serverPort string
}

// NewApp creates a new App application struct
func NewApp(opts ...AppOption) (*App, error) {
	app := &App{
		ctx:        context.Background(),
		target:     TargetDesktop,
		l:          &logging.NullLogger{},
		dbPath:     ":memory:",
		serverPort: "3111",
	}
	for _, o := range opts {
		o(app)
	}
	if app.target == "" {
		return nil, errors.New("app target empty")
	}
	if app.l == nil {
		return nil, errors.New("app logger required")
	}
	return app, nil
}

// Startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx

	a.l.Info("Starting nui app...")
	a.l.Info("database path: " + a.dbPath)

	nuiSvc, err := nui.Setup(a.dbPath, a.l)
	if err != nil {
		a.l.Error("fatal error setting up nui app: " + err.Error())
		os.Exit(1)
	}
	server := nui.NewServer(a.serverPort, nuiSvc, a.l)
	err = server.Start(ctx)
	if err != nil {
		a.l.Error("fatal error setting up nui app: " + err.Error())
		os.Exit(1)
	}
}
