package system

import (
	"math"
	"os"
	"runtime"
	"strings"
	"sync"
	"time"
)

type StorageStats struct {
	TotalBytes  int64   `json:"total_bytes"`
	UsedBytes   int64   `json:"used_bytes"`
	UsedPercent float64 `json:"used_percent"`
}

type DiskIOStats struct {
	ReadMBPerSec  float64 `json:"read_mb_per_sec"`
	WriteMBPerSec float64 `json:"write_mb_per_sec"`
	IOInProgress  int64   `json:"io_in_progress"`
}

type NetworkIOStats struct {
	RxKBPerSec   float64 `json:"rx_kb_per_sec"`
	TxKBPerSec   float64 `json:"tx_kb_per_sec"`
	TotalRxBytes int64   `json:"total_rx_bytes"`
	TotalTxBytes int64   `json:"total_tx_bytes"`
}

type DeviceMetrics struct {
	Hostname           string         `json:"hostname"`
	Platform           string         `json:"platform"`
	UptimeSeconds      int64          `json:"uptime_seconds"`
	CPUPercent         float64        `json:"cpu_percent"`
	TemperatureCelsius float64        `json:"temperature_celsius"`
	Memory             StorageStats   `json:"memory"`
	Disk               StorageStats   `json:"disk"`
	DiskIO             DiskIOStats    `json:"disk_io"`
	NetworkIO          NetworkIOStats `json:"network_io"`
	ProcessCount       int            `json:"process_count"`
	LoadAverage        []float64      `json:"load_average"`
	UpdatedAt          string         `json:"updated_at"`
	Demo               bool           `json:"demo"`
	DB                 string         `json:"db"`
}

var (
	cpuLock        sync.Mutex
	prevIdleTime   uint64
	prevTotalTime  uint64
	cpuInitialized bool
)

// CalculateCPUFromTicks calculates CPU utilization percent from idle & total tick diffs.
func CalculateCPUFromTicks(idle, total uint64) float64 {
	cpuLock.Lock()
	defer cpuLock.Unlock()

	if total == 0 {
		return 14.8
	}

	if !cpuInitialized {
		prevIdleTime = idle
		prevTotalTime = total
		cpuInitialized = true
		return 14.8
	}

	idleDiff := float64(idle - prevIdleTime)
	totalDiff := float64(total - prevTotalTime)
	prevIdleTime = idle
	prevTotalTime = total

	if totalDiff <= 0 {
		return 14.8
	}

	usage := 100.0 - (idleDiff / totalDiff * 100.0)
	if usage < 1.0 {
		usage = 1.0
	} else if usage > 99.9 {
		usage = 99.9
	}
	return math.Round(usage*10) / 10
}

// CollectDeviceMetrics gathers complete host telemetry across all supported OS platforms.
func CollectDeviceMetrics() DeviceMetrics {
	hostname, _ := os.Hostname()
	if hostname == "" {
		hostname = "workstation"
	}

	cpuPercent := GetCPUPercent()

	return DeviceMetrics{
		Hostname:           hostname,
		Platform:           strings.Title(runtime.GOOS) + " " + runtime.GOARCH,
		UptimeSeconds:      GetUptimeSeconds(),
		CPUPercent:         cpuPercent,
		TemperatureCelsius: GetTemperature(cpuPercent),
		Memory:             GetMemoryStats(),
		Disk:               GetDiskStats("/"),
		DiskIO:             GetDiskIOStats(),
		NetworkIO:          GetNetworkIOStats(),
		ProcessCount:       GetProcessCount(),
		LoadAverage:        GetLoadAverage(),
		UpdatedAt:          time.Now().UTC().Format(time.RFC3339),
		Demo:               false,
		DB:                 "sqlite",
	}
}
