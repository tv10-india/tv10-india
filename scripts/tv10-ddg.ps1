param([string]$Query, [int]$Max = 8)

$ErrorActionPreference = "Stop"
$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
$html = $wc.DownloadString("https://html.duckduckgo.com/html/?q=" + [uri]::EscapeDataString($Query))

$seen = @{}
$i = 0
foreach ($m in ([regex]'uddg=([^&"]+)').Matches($html)) {
    if ($i -ge $Max) { break }
    $u = [uri]::UnescapeDataString($m.Groups[1].Value)
    if ($seen.ContainsKey($u)) { continue }
    $seen[$u] = $true
    $i++
    Write-Output $u
}
Write-Output "==== $i unique results for: $Query"
