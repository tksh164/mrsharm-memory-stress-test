namespace MemoryStressTester.Services;

public class MemorySettings
{
    public int DefaultThresholdMB { get; set; } = 1024;
    public int MaxAllowedThresholdMB { get; set; } = 4096;
    public int CleanupIntervalSeconds { get; set; } = 30;
}
