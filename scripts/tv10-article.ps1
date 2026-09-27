param([string]$Url, [int]$MaxChars = 4500)

$ErrorActionPreference = "Stop"
$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
$html = $wc.DownloadString($Url)

# Drop non-content elements entirely
foreach ($tag in @("script", "style", "noscript", "svg", "nav", "header", "footer", "form")) {
    $html = [regex]::Replace($html, "(?is)<$tag\b[^>]*>.*?</$tag>", " ")
}

# Surface any explicit date metadata before flattening
foreach ($m in ([regex]'(?i)(?:datePublished|article:published_time|"pubDate"|dateModified)"?\s*[:=]\s*"([^"]{8,40})"').Matches($html)) {
    Write-Output ("META-DATE: " + $m.Groups[1].Value)
}

$text = [regex]::Replace($html, "(?s)<[^>]+>", " ")
$text = [System.Net.WebUtility]::HtmlDecode($text)
$text = [regex]::Replace($text, "[ \t\r\n]+", " ").Trim()

if ($text.Length -gt $MaxChars) { $text = $text.Substring(0, $MaxChars) }
Write-Output "----- LEN=$($text.Length) -----"
Write-Output $text
