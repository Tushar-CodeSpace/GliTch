package db

// User represents an operator account.
type User struct {
	ID           int64  `json:"id"`
	Username     string `json:"username"`
	PasswordHash string `json:"-"`
	Role         string `json:"role"`
	CreatedAt    string `json:"created_at"`
}

// Session represents an active authorization token.
type Session struct {
	Token     string `json:"token"`
	UserID    int64  `json:"user_id"`
	Username  string `json:"username"`
	Role      string `json:"role"`
	ExpiresAt string `json:"expires_at"`
	CreatedAt string `json:"created_at"`
}

// Incident represents an SRE alert.
type Incident struct {
	ID              string  `json:"id"`
	Title           string  `json:"title"`
	Description     string  `json:"description"`
	Severity        string  `json:"severity"`
	Service         string  `json:"service"`
	Timestamp       string  `json:"timestamp"`
	Status          string  `json:"status"`
	SuggestedAction string  `json:"suggestedAction,omitempty"`
	Command         string  `json:"command,omitempty"`
	Impact          string  `json:"impact,omitempty"`
	CreatedAt       string  `json:"created_at,omitempty"`
	ResolvedAt      *string `json:"resolvedAt,omitempty"`
}

// Service represents a monitored host or container service.
type Service struct {
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	Category  string   `json:"category"`
	Status    string   `json:"status"`
	CPU       float64  `json:"cpu"`
	Memory    string   `json:"memory"`
	Uptime    string   `json:"uptime"`
	Port      string   `json:"port"`
	Version   string   `json:"version"`
	Logs      []string `json:"logs"`
	UpdatedAt string   `json:"updated_at,omitempty"`
}

// Pipeline represents a CI/CD build run.
type Pipeline struct {
	ID        string        `json:"id"`
	Name      string        `json:"name"`
	Branch    string        `json:"branch"`
	Commit    string        `json:"commit"`
	Author    string        `json:"author"`
	Status    string        `json:"status"`
	Duration  string        `json:"duration"`
	Timestamp string        `json:"timestamp"`
	Stages    []interface{} `json:"stages"`
	UpdatedAt string        `json:"updated_at,omitempty"`
}

// CopilotChat represents a conversation entry.
type CopilotChat struct {
	ID             string   `json:"id"`
	Sender         string   `json:"sender"`
	Text           string   `json:"text"`
	Timestamp      string   `json:"timestamp"`
	ActionID       *string  `json:"actionId,omitempty"`
	ActionTitle    *string  `json:"actionTitle,omitempty"`
	ActionCommand  *string  `json:"actionCommand,omitempty"`
	ActionExecuted bool     `json:"actionExecuted"`
	Tags           []string `json:"tags"`
	CreatedAt      string   `json:"created_at,omitempty"`
}

// DBStatus represents SQLite health and row stats.
type DBStatus struct {
	Engine         string         `json:"engine"`
	DatabasePath   string         `json:"database_path"`
	SizeBytes      int64          `json:"size_bytes"`
	SizeFormatted  string         `json:"size_formatted"`
	Tables         []string       `json:"tables"`
	Counts         map[string]int `json:"counts"`
	IntegrityCheck string         `json:"integrity_check"`
	WALMode        bool           `json:"wal_mode"`
}

// MetricHistoryPoint represents a recorded host telemetry sample in SQLite.
type MetricHistoryPoint struct {
	ID                 int64   `json:"id"`
	Hostname           string  `json:"hostname"`
	Platform           string  `json:"platform"`
	UptimeSeconds      int64   `json:"uptime_seconds"`
	CPUPercent         float64 `json:"cpu_percent"`
	TemperatureCelsius float64 `json:"temperature_celsius"`
	MemoryUsedPercent  float64 `json:"memory_used_percent"`
	MemoryUsedBytes    int64   `json:"memory_used_bytes"`
	MemoryTotalBytes   int64   `json:"memory_total_bytes"`
	DiskUsedPercent    float64 `json:"disk_used_percent"`
	DiskUsedBytes      int64   `json:"disk_used_bytes"`
	DiskTotalBytes     int64   `json:"disk_total_bytes"`
	DiskReadMBPerSec   float64 `json:"disk_read_mb_per_sec"`
	DiskWriteMBPerSec  float64 `json:"disk_write_mb_per_sec"`
	NetRxKBPerSec      float64 `json:"net_rx_kb_per_sec"`
	NetTxKBPerSec      float64 `json:"net_tx_kb_per_sec"`
	ProcessCount       int     `json:"process_count"`
	Load1m             float64 `json:"load_1m"`
	Load5m             float64 `json:"load_5m"`
	Load15m            float64 `json:"load_15m"`
	RecordedAt         string  `json:"recorded_at"`
}
