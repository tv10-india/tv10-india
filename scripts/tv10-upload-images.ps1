$ErrorActionPreference = "Stop"

$tok = (Get-Content "$env:USERPROFILE\.config\sanity\tv10-token.txt" -Raw).Trim([char]0xFEFF).Trim()
$h   = @{ Authorization = "Bearer $tok" }

$p = Invoke-RestMethod -Uri "https://api.sanity.io/v2021-06-07/projects/uh81euwc" -Headers $h
if ($p.displayName -ne "tv10-news") { throw "WRONG PROJECT" }

$dash = [char]0x2013
$jobs = @(
  @{ slug = "uttarakhand-100-trek-route-gps-mapping";      url = "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Panorama_of_Himalayas_from_Ranikhet%2C_Uttarakhand%2C_India.jpg/1280px-Panorama_of_Himalayas_from_Ranikhet%2C_Uttarakhand%2C_India.jpg" },
  @{ slug = "uttarakhand-mukhyamantri-yuva-vidyarthi-manthan"; url = "https://upload.wikimedia.org/wikipedia/commons/2/20/Our_Village_Education_Life.jpg" },
  @{ slug = "up-818-niyukti-patra-lokbhavan-lucknow";      url = "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Lok_bhavan_lucknow.jpg/1280px-Lok_bhavan_lucknow.jpg" },
  @{ slug = "up-14-naye-rajkiya-nursing-college-840-seat"; url = "https://upload.wikimedia.org/wikipedia/commons/4/4b/Dhamtari_Nursing_Students_%285489663367%29.jpg" },
  @{ slug = "delhi-gtb-aspatal-trauma-block-244-crore";    url = "https://upload.wikimedia.org/wikipedia/commons/f/f7/Guru_Tegh_Bahadur_Hospital_%28side_entry%29.jpg" },
  @{ slug = "delhi-carbon-credit-bikri-yojana";            url = "https://upload.wikimedia.org/wikipedia/commons/9/9e/DTC_bus_on_the_Ring_Road_in_Delhi.jpg" },
  @{ slug = "rozgar-mela-51-hazar-niyukti-patra";          url = "https://upload.wikimedia.org/wikipedia/commons/8/8d/North_Block_of_the_Secretariat_buildings%2C_New_Delhi.jpg" },
  @{ slug = "kuno-cheetah-kgp12-char-shavak";              url = "https://upload.wikimedia.org/wikipedia/commons/d/db/Cheetah_In_India.jpg" },
  @{ slug = "bharat-bhutan-dwipakshiya-sahyog-samiksha";   url = "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/National_Memorial_Chorten%2C_Thimphu_01.jpg/1280px-National_Memorial_Chorten%2C_Thimphu_01.jpg" },
  @{ slug = "bharat-nepal-vyapar-parivahan-baithak";       url = "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Indo%E2%80%93Nepal_Friendship_Bridge_%28Raxaul%E2%80%93Birgunj_Border%29_May_2026.jpg/1280px-Indo%E2%80%93Nepal_Friendship_Bridge_%28Raxaul%E2%80%93Birgunj_Border%29_May_2026.jpg" },
  @{ slug = "radha-ashtami-2026-vrishabhanu-nandini";      url = "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Radha-_Krishna%2C_Kalighat_Painting.jpg/1280px-Radha-_Krishna%2C_Kalighat_Painting.jpg" },
  @{ slug = "ramkatha-poore-asia-mein-kochi-sammelan";     url = "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Candi_Prambanan_-_018_Ramayana_Relief%2C_Siva_Temple_%2812041689593%29.jpg/1280px-Candi_Prambanan_-_018_Ramayana_Relief%2C_Siva_Temple_%2812041689593%29.jpg" },
  @{ slug = "net-pratyaksh-kar-sangrah-12-lakh-crore";     url = "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Indian_50-rupees_banknote_closeup_%2868912%29.jpg/1280px-Indian_50-rupees_banknote_closeup_%2868912%29.jpg" },
  @{ slug = "nse-ipo-22569-crore-poora-subscribe";         url = "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/National_Stock_Exchange.jpg/1280px-National_Stock_Exchange.jpg" },
  @{ slug = "asian-games-2026-dhwajvahak-manu-bhaker-toor"; url = "https://upload.wikimedia.org/wikipedia/commons/f/f1/Paris_Olympics_double_bronze_medalist_Manu_Bhaker_in_August_2024.jpg" },
  @{ slug = "bharat-afghanistan-t20-series-3-0-jeet";      url = "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Arun_Jaitley_Stadium_during_World_Cup_2023.jpg/1280px-Arun_Jaitley_Stadium_during_World_Cup_2023.jpg" },
  @{ slug = "uttarakhand-rajya-film-awards-pehli-baar";    url = "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Filmmuseum_Berlin_-_Cinemeccanica%2C_Gangs_of_New_York_Clapperboard.jpg/1280px-Filmmuseum_Berlin_-_Cinemeccanica%2C_Gangs_of_New_York_Clapperboard.jpg" },
  @{ slug = "uttarakhand-odop-odtp-13-jilon-ke-utpad";     url = "https://upload.wikimedia.org/wikipedia/commons/9/9a/Bal_mithai.jpg" },
  @{ slug = "chandrama-par-naya-vishal-gaddha-nasa";       url = "https://upload.wikimedia.org/wikipedia/commons/f/f7/Recent_Impact_Crater_on_the_Lunar_Surface_Showing_Crater_Illusion.jpg" },
  @{ slug = "sabse-kam-umra-ka-grah-elias-2-24-b";         url = "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Protoplanetary_Disk_%28Artist%27s_Concept%29_%282024-121%29.jpg/1280px-Protoplanetary_Disk_%28Artist%27s_Concept%29_%282024-121%29.jpg" }
)

$dir = Join-Path $PSScriptRoot "..\.tv10-img"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

$mapPath = Join-Path $PSScriptRoot "tv10-assets.json"
$map = @{}
if (Test-Path $mapPath) {
    $existing = Get-Content $mapPath -Raw | ConvertFrom-Json
    foreach ($pr in $existing.PSObject.Properties) { $map[$pr.Name] = $pr.Value }
}

foreach ($j in $jobs) {
    if ($map.ContainsKey($j.slug)) { Write-Output ("SKIP  " + $j.slug + " -> " + $map[$j.slug]); continue }

    $file = Join-Path $dir ($j.slug + ".jpg")
    if (-not (Test-Path $file)) {
        Invoke-WebRequest -Uri $j.url -OutFile $file -UseBasicParsing -UserAgent "TV10IndiaNewsdesk/1.0 (https://www.tv10india.com; desk@tv10india.com)"
        Start-Sleep -Milliseconds 800
    }
    $len = (Get-Item $file).Length
    if ($len -lt 8000) { throw ("TOO SMALL: " + $j.slug + " = " + $len + " bytes") }

    $up = "https://uh81euwc.api.sanity.io/v2021-06-07/assets/images/production?filename=" + $j.slug + ".jpg"
    $res = Invoke-RestMethod -Uri $up -Method Post -Headers $h -ContentType "image/jpeg" -InFile $file
    $aid = $res.document._id
    if ([string]::IsNullOrWhiteSpace($aid)) { throw ("NO ASSET ID for " + $j.slug) }
    $map[$j.slug] = $aid
    Write-Output ("OK    " + $j.slug + "  " + $len + "b  -> " + $aid)

    ($map | ConvertTo-Json) | Out-File -FilePath $mapPath -Encoding utf8
    Start-Sleep -Milliseconds 400
}

Write-Output ("==== assets mapped: " + $map.Count)
