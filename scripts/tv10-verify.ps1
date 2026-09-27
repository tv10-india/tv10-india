$ErrorActionPreference = "Stop"

$slugs = @(
  "uttarakhand-100-trek-route-gps-mapping",
  "uttarakhand-mukhyamantri-yuva-vidyarthi-manthan",
  "up-818-niyukti-patra-lokbhavan-lucknow",
  "up-14-naye-rajkiya-nursing-college-840-seat",
  "delhi-gtb-aspatal-trauma-block-244-crore",
  "delhi-carbon-credit-bikri-yojana",
  "rozgar-mela-51-hazar-niyukti-patra",
  "kuno-cheetah-kgp12-char-shavak",
  "bharat-bhutan-dwipakshiya-sahyog-samiksha",
  "bharat-nepal-vyapar-parivahan-baithak",
  "radha-ashtami-2026-vrishabhanu-nandini",
  "ramkatha-poore-asia-mein-kochi-sammelan",
  "net-pratyaksh-kar-sangrah-12-lakh-crore",
  "nse-ipo-22569-crore-poora-subscribe",
  "asian-games-2026-dhwajvahak-manu-bhaker-toor",
  "bharat-afghanistan-t20-series-3-0-jeet",
  "uttarakhand-rajya-film-awards-pehli-baar",
  "uttarakhand-odop-odtp-13-jilon-ke-utpad",
  "chandrama-par-naya-vishal-gaddha-nasa",
  "sabse-kam-umra-ka-grah-elias-2-24-b"
)
$ids = ($slugs | ForEach-Object { '"post-' + $_ + '"' }) -join ","

function Q([string]$groq) {
    $c = New-Object System.Net.WebClient
    $c.Encoding = [System.Text.Encoding]::UTF8
    $u = "https://uh81euwc.api.sanity.io/v2021-06-07/data/query/production?query=" + [uri]::EscapeDataString($groq)
    $r = ($c.DownloadString($u) | ConvertFrom-Json).result
    $c.Dispose()
    return $r
}

$sel = "*[_id in [$ids]]"

Write-Output "===== BATCH VERIFICATION (by explicit _id list) ====="
Write-Output ("batch docs found            : " + (Q "count($sel)") + " / 20")
Write-Output ("with mainImage.asset ref    : " + (Q "count($sel[defined(mainImage.asset._ref)])") + " / 20")
Write-Output ("author == author-news-desk  : " + (Q "count($sel[author._ref == 'author-news-desk'])") + " / 20")
Write-Output ("editorialStatus published   : " + (Q "count($sel[editorialStatus == 'published'])") + " / 20")
Write-Output ("priority == 0               : " + (Q "count($sel[priority == 0])") + " / 20")
Write-Output ("isBreaking == false         : " + (Q "count($sel[isBreaking == false])") + " / 20")
Write-Output ("_type == post               : " + (Q "count($sel[_type == 'post'])") + " / 20")
Write-Output ("slug.current matches _id    : " + (Q "count($sel[('post-' + slug.current) == _id])") + " / 20")
Write-Output ""
Write-Output "---- fields that must be UNSET (expect 0) ----"
Write-Output ("district defined            : " + (Q "count($sel[defined(district)])"))
Write-Output ("tags defined                : " + (Q "count($sel[defined(tags)])"))
Write-Output ("styledTitle defined         : " + (Q "count($sel[defined(styledTitle)])"))
Write-Output ""
Write-Output "---- forbidden categories (expect 0) ----"
Write-Output ("category videos             : " + (Q "count($sel[category == 'videos'])"))
Write-Output ("category web-stories        : " + (Q "count($sel[category == 'web-stories'])"))
Write-Output ""
Write-Output "---- per-category (expect 2 each) ----"
foreach ($c in @("up","uk","delhi","national","world","dharma","business","sports","lifestyle","mystery")) {
    Write-Output ("  {0,-10} = {1}" -f $c, (Q "count($sel[category == '$c'])"))
}
Write-Output ""
Write-Output "---- publishedAt round-trip (must all parse) ----"
$pubs = Q "$sel | order(publishedAt asc) { 'sl': slug.current, 'pa': publishedAt }"
$bad = 0
foreach ($r in $pubs) {
    $s = [string]$r.pa
    try {
        [void][datetime]::Parse($s, [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::RoundtripKind)
    } catch { $bad++; Write-Output ("  UNPARSEABLE :: " + $r.sl + " :: " + $s) }
    if ($s -cnotmatch '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$') { $bad++; Write-Output ("  BAD SHAPE :: " + $r.sl + " :: " + $s) }
}
Write-Output ("  stored values checked     : " + @($pubs).Count + ", failures: " + $bad)
Write-Output ""
Write-Output "---- body length from the live dataset ----"
$lens = Q "$sel { 'sl': slug.current, 'len': length(pt::text(body)) } | order(len asc)"
$st = ($lens | Select-Object -ExpandProperty len) | Measure-Object -Minimum -Maximum -Average
Write-Output ("  min=" + $st.Minimum + "  max=" + $st.Maximum + "  avg=" + [math]::Round($st.Average,0))
Write-Output ""
Write-Output "---- totals ----"
Write-Output ("total posts now             : " + (Q 'count(*[_type=="post"])'))
Write-Output ("posts dated 2026-09-18      : " + (Q 'count(*[_type=="post" && publishedAt >= "2026-09-18T00:00:00Z" && publishedAt < "2026-09-19T00:00:00Z"])'))
