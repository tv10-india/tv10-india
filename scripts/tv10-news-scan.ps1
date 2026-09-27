param([string]$Query, [int]$Max = 25, [string]$Lang = "hi")

$ErrorActionPreference = "Stop"
$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$wc.Headers.Add("User-Agent", "Mozilla/5.0")

if ($Lang -eq "hi") { $loc = "hl=hi&gl=IN&ceid=IN:hi" } else { $loc = "hl=en-IN&gl=IN&ceid=IN:en" }
$url = "https://news.google.com/rss/search?q=" + [uri]::EscapeDataString($Query) + "&" + $loc

$xml = [xml]$wc.DownloadString($url)
$i = 0
foreach ($item in $xml.rss.channel.item) {
    if ($i -ge $Max) { break }
    $i++
    $src = $item.source.'#text'
    Write-Output ("[{0}] {1}" -f $item.pubDate, $item.title)
    Write-Output ("     src={0}" -f $src)
}
Write-Output "---- $i items for: $Query"
