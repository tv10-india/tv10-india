param([switch]$Live)

$ErrorActionPreference = "Stop"

# ---- credentials & project guard -------------------------------------------
$tok = (Get-Content "$env:USERPROFILE\.config\sanity\tv10-token.txt" -Raw).Trim([char]0xFEFF).Trim()
$h   = @{ Authorization = "Bearer $tok" }

$p = Invoke-RestMethod -Uri "https://api.sanity.io/v2021-06-07/projects/uh81euwc" -Headers $h
if ($p.displayName -ne "tv10-news") { throw "WRONG PROJECT" }
Write-Output ("PROJECT OK :: " + $p.displayName + "  id=" + $p.id)

# ---- publishedAt: literal strings, defined here, never round-tripped --------
# PS 5.1 ConvertFrom-Json coerces ISO strings into [DateTime]. Keeping these as
# PowerShell string literals means no deserializer ever touches them.
$pubAt = @{
  "uttarakhand-100-trek-route-gps-mapping"        = "2026-09-18T05:35:00.000Z"
  "uttarakhand-mukhyamantri-yuva-vidyarthi-manthan" = "2026-09-18T06:50:00.000Z"
  "up-818-niyukti-patra-lokbhavan-lucknow"        = "2026-09-18T08:05:00.000Z"
  "up-14-naye-rajkiya-nursing-college-840-seat"   = "2026-09-18T05:10:00.000Z"
  "delhi-gtb-aspatal-trauma-block-244-crore"      = "2026-09-18T04:25:00.000Z"
  "delhi-carbon-credit-bikri-yojana"              = "2026-09-18T04:50:00.000Z"
  "rozgar-mela-51-hazar-niyukti-patra"            = "2026-09-18T09:20:00.000Z"
  "kuno-cheetah-kgp12-char-shavak"                = "2026-09-18T09:05:00.000Z"
  "bharat-bhutan-dwipakshiya-sahyog-samiksha"     = "2026-09-18T08:40:00.000Z"
  "bharat-nepal-vyapar-parivahan-baithak"         = "2026-09-18T07:25:00.000Z"
  "radha-ashtami-2026-vrishabhanu-nandini"        = "2026-09-18T07:50:00.000Z"
  "ramkatha-poore-asia-mein-kochi-sammelan"       = "2026-09-18T09:35:00.000Z"
  "net-pratyaksh-kar-sangrah-12-lakh-crore"       = "2026-09-18T08:55:00.000Z"
  "nse-ipo-22569-crore-poora-subscribe"           = "2026-09-18T10:10:00.000Z"
  "asian-games-2026-dhwajvahak-manu-bhaker-toor"  = "2026-09-18T06:25:00.000Z"
  "bharat-afghanistan-t20-series-3-0-jeet"        = "2026-09-18T03:45:00.000Z"
  "uttarakhand-rajya-film-awards-pehli-baar"      = "2026-09-18T06:05:00.000Z"
  "uttarakhand-odop-odtp-13-jilon-ke-utpad"       = "2026-09-18T07:05:00.000Z"
  "chandrama-par-naya-vishal-gaddha-nasa"         = "2026-09-18T04:05:00.000Z"
  "sabse-kam-umra-ka-grah-elias-2-24-b"           = "2026-09-18T10:25:00.000Z"
}

# ---- inputs -----------------------------------------------------------------
$arts   = Get-Content (Join-Path $PSScriptRoot "tv10-articles.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$assets = Get-Content (Join-Path $PSScriptRoot "tv10-assets.json")   -Raw -Encoding UTF8 | ConvertFrom-Json

$assetMap = @{}
foreach ($pr in $assets.PSObject.Properties) { $assetMap[$pr.Name] = $pr.Value }

# Words that must never appear in a body: agencies, channels, rival outlets.
$banned = @("पीटीआई","एएनआई","एजेंसी","एजेंसियों","संवाददाता","ब्यूरो","आईएएनएस","भाषा इनपुट")

$problems = New-Object System.Collections.ArrayList
$mutations = New-Object System.Collections.ArrayList
$seen = @{}
$catCount = @{}
$lengths = New-Object System.Collections.ArrayList

$i = 0
foreach ($a in $arts) {
    $i++
    $slug = [string]$a.slug
    $cat  = [string]$a.category
    $ttl  = [string]$a.title

    if ($seen.ContainsKey($slug)) { [void]$problems.Add("DUPLICATE SLUG :: $slug") }
    $seen[$slug] = $true

    # --- slug shape: lowercase ascii + digits + hyphen only
    if ($slug -cnotmatch '^[a-z0-9]+(-[a-z0-9]+)*$') { [void]$problems.Add("BAD SLUG :: $slug") }

    # --- publishedAt must be a literal, invariant-parseable ISO string
    if (-not $pubAt.ContainsKey($slug)) { throw "NO publishedAt FOR :: $slug" }
    $iso = [string]$pubAt[$slug]
    if ($iso -cnotmatch '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$') { [void]$problems.Add("BAD ISO SHAPE :: $slug :: $iso") }
    $parsed = [datetime]::Parse($iso, [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::RoundtripKind)
    if ($parsed.ToUniversalTime() -gt [datetime]::UtcNow) { [void]$problems.Add("FUTURE DATE :: $slug :: $iso") }

    # --- image
    if (-not $assetMap.ContainsKey($slug)) { [void]$problems.Add("NO IMAGE ASSET :: $slug") }
    $aid = [string]$assetMap[$slug]

    # --- no stray Latin letters anywhere in title
    if ($ttl -cmatch '[A-Za-z]') { [void]$problems.Add("LATIN IN TITLE :: $slug :: " + ([regex]::Matches($ttl,'[A-Za-z]+') -join ',')) }

    # --- build portable text
    $children = New-Object System.Collections.ArrayList
    $bodyLen = 0
    $n = 0
    $subheads = 0
    $bullets  = 0
    foreach ($b in $a.blocks) {
        $n++
        $t = [string]$b.t
        $bodyLen += $t.Length
        if ($t -cmatch '[A-Za-z]') { [void]$problems.Add("LATIN IN BODY :: $slug :: blk$n :: " + ([regex]::Matches($t,'[A-Za-z]+') -join ',')) }
        foreach ($w in $banned) { if ($t.Contains($w)) { [void]$problems.Add("BANNED WORD :: $slug :: blk$n :: $w") } }

        $key = "b{0:d2}{1:d2}" -f $i, $n
        $blk = [ordered]@{
            _type    = "block"
            _key     = $key
            markDefs = @()
            children = @( [ordered]@{ _type = "span"; _key = ($key + "s0"); text = $t; marks = @() } )
        }
        if ($b.s -eq "h2") { $blk["style"] = "h4"; $subheads++ }
        elseif ($b.s -eq "li") {
            $blk["style"] = "normal"
            $blk["listItem"] = "bullet"
            $blk["level"] = 1
            $bullets++
        }
        else { $blk["style"] = "normal" }
        [void]$children.Add($blk)
    }

    if ($bodyLen -lt 1500 -or $bodyLen -gt 2900) { [void]$problems.Add("BODY LEN OUT OF RANGE :: $slug :: $bodyLen") }
    [void]$lengths.Add($bodyLen)

    $paras = $n - $subheads - $bullets
    if ($paras -lt 4 -or $paras -gt 8) { [void]$problems.Add("PARA COUNT :: $slug :: $paras") }
    if ($subheads -lt 1 -or $subheads -gt 2) { [void]$problems.Add("SUBHEAD COUNT :: $slug :: $subheads") }

    if ($catCount.ContainsKey($cat)) { $catCount[$cat] = $catCount[$cat] + 1 } else { $catCount[$cat] = 1 }
    if ($cat -eq "videos" -or $cat -eq "web-stories") { [void]$problems.Add("FORBIDDEN CATEGORY :: $slug :: $cat") }

    $doc = [ordered]@{
        _id             = "post-" + $slug
        _type           = "post"
        title           = $ttl
        slug            = [ordered]@{ _type = "slug"; current = $slug }
        category        = $cat
        publishedAt     = $iso
        editorialStatus = "published"
        priority        = 0
        isBreaking      = $false
        author          = [ordered]@{ _type = "reference"; _ref = "author-news-desk" }
        mainImage       = [ordered]@{ _type = "image"; asset = [ordered]@{ _type = "reference"; _ref = $aid } }
        body            = @($children)
    }

    # Fields that must never be set on these documents.
    foreach ($f in @("district","tags","styledTitle")) {
        if ($doc.Contains($f)) { [void]$problems.Add("FORBIDDEN FIELD :: $slug :: $f") }
    }

    [void]$mutations.Add([ordered]@{ createIfNotExists = $doc })

    Write-Output ("{0,2}. {1,-10} {2}  len={3} paras={4} h4={5} li={6}" -f $i, $cat, $slug, $bodyLen, $paras, $subheads, $bullets)
}

Write-Output ""
foreach ($k in ($catCount.Keys | Sort-Object)) { Write-Output ("CAT  " + $k + " = " + $catCount[$k]) }
$stats = $lengths | Measure-Object -Minimum -Maximum -Average
Write-Output ("BODY len  min=" + $stats.Minimum + "  max=" + $stats.Maximum + "  avg=" + [math]::Round($stats.Average, 0))
Write-Output ("ARTICLES  " + $mutations.Count)

if ($problems.Count -gt 0) {
    Write-Output ""
    Write-Output "==== PROBLEMS ===="
    foreach ($pb in $problems) { Write-Output $pb }
    throw ("VALIDATION FAILED :: " + $problems.Count + " problem(s) - nothing sent.")
}
Write-Output "VALIDATION CLEAN"

# ---- serialise --------------------------------------------------------------
$payload = [ordered]@{ mutations = @($mutations) }
$json = $payload | ConvertTo-Json -Depth 12 -Compress
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
Write-Output ("PAYLOAD bytes=" + $bytes.Length)

$base = "https://uh81euwc.api.sanity.io/v2021-06-07/data/mutate/production"
$uri = $base + "?dryRun=true"
if ($Live) { $uri = $base + "?returnIds=true" }

# Baseline read happens in the same script that POSTs (live desk: others publish mid-run).
if ($Live) {
    $wc = New-Object System.Net.WebClient
    $wc.Encoding = [System.Text.Encoding]::UTF8
    $cq = [uri]::EscapeDataString('count(*[_type=="post"])')
    $before = ($wc.DownloadString("https://uh81euwc.api.sanity.io/v2021-06-07/data/query/production?query=$cq") | ConvertFrom-Json).result
    Write-Output ("TOTAL POSTS BEFORE = " + $before)
}

Write-Output ("POST -> " + $uri)
$res = Invoke-RestMethod -Uri $uri -Method Post -Headers $h -ContentType "application/json" -Body $bytes
Write-Output ("RESULTS COUNT = " + @($res.results).Count)
if ($res.transactionId) { Write-Output ("TXN = " + $res.transactionId) }
foreach ($r in $res.results) { Write-Output ("  " + $r.operation + "  " + $r.id) }
