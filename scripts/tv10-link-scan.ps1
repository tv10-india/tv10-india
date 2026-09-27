param([string]$Url, [string]$Pattern = ".", [int]$Max = 40)

$ErrorActionPreference = "Stop"
$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
$html = $wc.DownloadString($Url)

$base = [uri]$Url
$seen = @{}
$i = 0

$rx = [regex]'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>'
foreach ($m in $rx.Matches($html)) {
    if ($i -ge $Max) { break }
    $href = $m.Groups[1].Value
    $text = $m.Groups[2].Value -replace '<[^>]+>', '' -replace '\s+', ' '
    $text = [System.Net.WebUtility]::HtmlDecode($text).Trim()
    if ($text.Length -lt 25) { continue }
    if ($href -notmatch $Pattern) { continue }
    try { $abs = ([uri]::new($base, $href)).AbsoluteUri } catch { continue }
    if ($seen.ContainsKey($abs)) { continue }
    $seen[$abs] = $true
    $i++
    Write-Output $text
    Write-Output ("   -> " + $abs)
}
Write-Output "==== $i links from $Url"
