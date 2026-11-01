package db

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/Tushar-CodeSpace/GliTch/services/daemon/internal/system"
)

// RecordMetricsSample writes a telemetry snapshot into SQLite metrics_history.
func RecordMetricsSample(database *sql.DB, m system.DeviceMetrics) error {
	if database == nil {
		return fmt.Errorf("database connection is nil")
	}

	load1, load5, load15 := 0.0, 0.0, 0.0
	if len(m.LoadAverage) > 0 {
		load1 = m.LoadAverage[0]
	}
	if len(m.LoadAverage) > 1 {
		load5 = m.LoadAverage[1]
	}
	if len(m.LoadAverage) > 2 {
		load15 = m.LoadAverage[2]
	}

	query := `
		INSERT INTO metrics_history (
			hostname, platform, uptime_seconds, cpu_percent, temperature_celsius,
			memory_used_percent, memory_used_bytes, memory_total_bytes,
			disk_used_percent, disk_used_bytes, disk_total_bytes,
			disk_read_mb_per_sec, disk_write_mb_per_sec,
			net_rx_kb_per_sec, net_tx_kb_per_sec, process_count,
			load_1m, load_5m, load_15m, recorded_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	recordedAt := m.UpdatedAt
	if recordedAt == "" {
		recordedAt = time.Now().UTC().Format(time.RFC3339)
	}

	_, err := database.Exec(
		query,
		m.Hostname, m.Platform, m.UptimeSeconds, m.CPUPercent, m.TemperatureCelsius,
		m.Memory.UsedPercent, m.Memory.UsedBytes, m.Memory.TotalBytes,
		m.Disk.UsedPercent, m.Disk.UsedBytes, m.Disk.TotalBytes,
		m.DiskIO.ReadMBPerSec, m.DiskIO.WriteMBPerSec,
		m.NetworkIO.RxKBPerSec, m.NetworkIO.TxKBPerSec, m.ProcessCount,
		load1, load5, load15, recordedAt,
	)
	return err
}

// GetMetricsHistory retrieves historical telemetry samples within a timeRange (e.g., "15m", "1h", "6h", "24h").
func GetMetricsHistory(database *sql.DB, limit int, timeRange string) ([]MetricHistoryPoint, error) {
	if database == nil {
		return nil, fmt.Errorf("database connection is nil")
	}

	if limit <= 0 || limit > 1000 {
		limit = 60
	}

	// Calculate cutoff interval for SQLite datetime modifier
	var modifier string
	switch timeRange {
	case "15m":
		modifier = "-15 minutes"
	case "1h":
		modifier = "-1 hour"
	case "6h":
		modifier = "-6 hours"
	case "24h":
		modifier = "-24 hours"
	default:
		modifier = "-1 hour"
	}

	// Query latest points, ordered ascending by time for sparklines/charts
	query := `
		SELECT
			id, hostname, platform, uptime_seconds, cpu_percent,
			COALESCE(temperature_celsius, 0.0),
			memory_used_percent, memory_used_bytes, memory_total_bytes,
			disk_used_percent, disk_used_bytes, disk_total_bytes,
			COALESCE(disk_read_mb_per_sec, 0.0),
			COALESCE(disk_write_mb_per_sec, 0.0),
			COALESCE(net_rx_kb_per_sec, 0.0),
			COALESCE(net_tx_kb_per_sec, 0.0),
			COALESCE(process_count, 0),
			load_1m, load_5m, load_15m, recorded_at
		FROM metrics_history
		WHERE recorded_at >= datetime('now', ?)
		ORDER BY id DESC
		LIMIT ?
	`

	rows, err := database.Query(query, modifier, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query metrics history: %w", err)
	}
	defer rows.Close()

	var points []MetricHistoryPoint
	for rows.Next() {
		var pt MetricHistoryPoint
		if err := rows.Scan(
			&pt.ID, &pt.Hostname, &pt.Platform, &pt.UptimeSeconds, &pt.CPUPercent,
			&pt.TemperatureCelsius,
			&pt.MemoryUsedPercent, &pt.MemoryUsedBytes, &pt.MemoryTotalBytes,
			&pt.DiskUsedPercent, &pt.DiskUsedBytes, &pt.DiskTotalBytes,
			&pt.DiskReadMBPerSec, &pt.DiskWriteMBPerSec,
			&pt.NetRxKBPerSec, &pt.NetTxKBPerSec, &pt.ProcessCount,
			&pt.Load1m, &pt.Load5m, &pt.Load15m, &pt.RecordedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan metrics history point: %w", err)
		}
		points = append(points, pt)
	}

	// If fewer points found inside the timeRange, grab latest samples so the UI never displays empty
	if len(points) == 0 {
		fallbackQuery := `
			SELECT
				id, hostname, platform, uptime_seconds, cpu_percent,
				COALESCE(temperature_celsius, 0.0),
				memory_used_percent, memory_used_bytes, memory_total_bytes,
				disk_used_percent, disk_used_bytes, disk_total_bytes,
				COALESCE(disk_read_mb_per_sec, 0.0),
				COALESCE(disk_write_mb_per_sec, 0.0),
				COALESCE(net_rx_kb_per_sec, 0.0),
				COALESCE(net_tx_kb_per_sec, 0.0),
				COALESCE(process_count, 0),
				load_1m, load_5m, load_15m, recorded_at
			FROM metrics_history
			ORDER BY id DESC
			LIMIT ?
		`
		fbRows, err := database.Query(fallbackQuery, limit)
		if err == nil {
			defer fbRows.Close()
			for fbRows.Next() {
				var pt MetricHistoryPoint
				if err := fbRows.Scan(
					&pt.ID, &pt.Hostname, &pt.Platform, &pt.UptimeSeconds, &pt.CPUPercent,
					&pt.TemperatureCelsius,
					&pt.MemoryUsedPercent, &pt.MemoryUsedBytes, &pt.MemoryTotalBytes,
					&pt.DiskUsedPercent, &pt.DiskUsedBytes, &pt.DiskTotalBytes,
					&pt.DiskReadMBPerSec, &pt.DiskWriteMBPerSec,
					&pt.NetRxKBPerSec, &pt.NetTxKBPerSec, &pt.ProcessCount,
					&pt.Load1m, &pt.Load5m, &pt.Load15m, &pt.RecordedAt,
				); err == nil {
					points = append(points, pt)
				}
			}
		}
	}

	// Reverse points so they are chronologically ordered (oldest -> newest) for plotting
	for i, j := 0, len(points)-1; i < j; i, j = i+1, j-1 {
		points[i], points[j] = points[j], points[i]
	}

	return points, nil
}

// PruneOldMetrics deletes telemetry samples older than keepHours to keep SQLite fast and compact.
func PruneOldMetrics(database *sql.DB, keepHours int) error {
	if database == nil {
		return fmt.Errorf("database connection is nil")
	}
	if keepHours <= 0 {
		keepHours = 48
	}
	modifier := fmt.Sprintf("-%d hours", keepHours)
	_, err := database.Exec("DELETE FROM metrics_history WHERE recorded_at < datetime('now', ?)", modifier)
	return err
}
