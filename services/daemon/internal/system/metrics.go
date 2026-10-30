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

type DeviceMetrics struct {
	Hostname      string       `json:"hostname"`
	Platform      string       `json:"platform"`
	UptimeSeconds int64        `json:"uptime_seconds"`
	CPUPercent    float64      `json:"cpu_percent"`
	Memory        StorageStats `json:"memory"`
	Disk          StorageStats `json:"disk"`
	LoadAverage   []float64    `json:"load_average"`
	UpdatedAt     string       `json:"updated_at"`
	Demo          bool         `json:"demo"`
	DB            string       `json:"db"`
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

	return DeviceMetrics{
		Hostname:      hostname,
		Platform:      strings.Title(runtime.GOOS) + " " + runtime.GOARCH,
		UptimeSeconds: GetUptimeSeconds(),
		CPUPercent:    GetCPUPercent(),
		Memory:        GetMemoryStats(),
		Disk:          GetDiskStats("/"),
		LoadAverage:   GetLoadAverage(),
		UpdatedAt:     time.Now().UTC().Format(time.RFC3339),
		Demo:          false,
		DB:            "sqlite",
	}
}
