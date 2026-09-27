param(
    [string]$Search = "",
    [string]$Titles = "",
    [int]$Max = 12
)

$ErrorActionPreference = "Stop"
$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
$wc.Headers.Add("User-Agent", "TV10IndiaNewsdesk/1.0 (https://www.tv10india.com; desk@tv10india.com)")
$wc.Headers.Add("Accept-Encoding", "identity")

function Strip-Html([string]$s) {
    if ($null -eq $s) { return "" }
    $s = [regex]::Replace($s, "(?s)<[^>]+>", " ")
    $s = [System.Net.WebUtility]::HtmlDecode($s)
    return ([regex]::Replace($s, "\s+", " ")).Trim()
}

function Get-Json([string]$u) {
    for ($a = 1; $a -le 5; $a++) {
        try {
            # Fresh client per request: reusing one across calls gets 403'd here.
            $c = New-Object System.Net.WebClient
            $c.Encoding = [System.Text.Encoding]::UTF8
            $c.Headers.Add("User-Agent", "TV10IndiaNewsdesk/1.0 (https://www.tv10india.com; desk@tv10india.com)")
            $c.Headers.Add("Accept-Encoding", "identity")
            $s = $c.DownloadString($u)
            $c.Dispose()
            return ($s | ConvertFrom-Json)
        }
        catch { Start-Sleep -Seconds (2 * $a) }
    }
    throw "FETCH-FAILED :: $u"
}

if ($Search -ne "") {
    $u = "https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=$Max&srsearch=" + [uri]::EscapeDataString($Search)
    $j = Get-Json $u
    foreach ($r in $j.query.search) { Write-Output $r.title }
    Write-Output ("==== search: " + $Search)
    return
}

# Title mode: resolve each File: page so a bad filename fails loudly.
foreach ($t in ($Titles -split "\|\|")) {
    $t = $t.Trim()
    if ($t -eq "") { continue }
    Start-Sleep -Milliseconds 1500
    $u = "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1280&titles=" + [uri]::EscapeDataString($t)
    $j = Get-Json $u
    $pages = $j.query.pages
    foreach ($p in $pages.PSObject.Properties) {
        $pg = $p.Value
        if ($p.Name -eq "-1" -or $null -eq $pg.imageinfo) {
            Write-Output ("MISSING :: " + $t)
            continue
        }
        $ii = $pg.imageinfo[0]
        $em = $ii.extmetadata
        $lic = ""
        if ($em.LicenseShortName) { $lic = Strip-Html $em.LicenseShortName.value }
        $art = ""
        if ($em.Artist) { $art = Strip-Html $em.Artist.value }
        if ($art.Length -gt 90) { $art = $art.Substring(0, 90) }
        Write-Output ("OK      :: " + $pg.title)
        Write-Output ("  mime  :: " + $ii.mime + "  " + $ii.width + "x" + $ii.height)
        Write-Output ("  lic   :: " + $lic)
        Write-Output ("  by    :: " + $art)
        Write-Output ("  thumb :: " + ($ii.thumburl -replace '\?.*$', ''))
    }
}
