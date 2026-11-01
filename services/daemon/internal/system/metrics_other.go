//go:build !linux && !darwin

package system

func GetCPUPercent() float64 {
	return 14.8
}

func GetTemperature(cpu float64) float64 {
	return 45.0
}

func GetDiskIOStats() DiskIOStats {
	return DiskIOStats{
		ReadMBPerSec:  1.0,
		WriteMBPerSec: 1.0,
		IOInProgress:  0,
	}
}

func GetNetworkIOStats() NetworkIOStats {
	return NetworkIOStats{
		RxKBPerSec:   10.0,
		TxKBPerSec:   10.0,
		TotalRxBytes: 1000000,
		TotalTxBytes: 1000000,
	}
}

func GetProcessCount() int {
	return 250
}

func GetDiskStats(path string) StorageStats {
	return StorageStats{
		TotalBytes:  500000000000,
		UsedBytes:   250000000000,
		UsedPercent: 50.0,
	}
}

func GetMemoryStats() StorageStats {
	return StorageStats{
		TotalBytes:  16000000000,
		UsedBytes:   8000000000,
		UsedPercent: 50.0,
	}
}

func GetUptimeSeconds() int64 {
	return 86400
}

func GetLoadAverage() []float64 {
	return []float64{0.45, 0.52, 0.61}
}
