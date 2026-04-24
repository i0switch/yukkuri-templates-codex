param()

$ErrorActionPreference = 'Stop'

New-Item -ItemType Directory -Force -Path 'docs' | Out-Null

function New-Grid {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Pair
  )

  $ids = @('01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','20','21','22')
  $inputs = @()
  $scaleParts = @()
  $rows = @()

  for ($i = 0; $i -lt $ids.Count; $i++) {
    $id = $ids[$i]
    $inputs += '-i'
    $inputs += "out/scene-$id-$Pair.png"
    $scaleParts += "[$($i):v]scale=384:216[v$($i)]"
  }

  $scaleParts += "color=c=black:s=384x216[pad1]"
  $scaleParts += "color=c=black:s=384x216[pad2]"
  $scaleParts += "color=c=black:s=384x216[pad3]"
  $scaleParts += "color=c=black:s=384x216[pad4]"

  $rows += '[v0][v1][v2][v3][v4]hstack=inputs=5[r1]'
  $rows += '[v5][v6][v7][v8][v9]hstack=inputs=5[r2]'
  $rows += '[v10][v11][v12][v13][v14]hstack=inputs=5[r3]'
  $rows += '[v15][v16][v17][v18][v19]hstack=inputs=5[r4]'
  $rows += '[v20][pad1][pad2][pad3][pad4]hstack=inputs=5[r5]'
  $rows += '[r1][r2][r3][r4][r5]vstack=inputs=5[outv]'

  $filter = ($scaleParts + $rows) -join ';'
  $outPath = "docs/all-scenes-$Pair-grid.png"

  & ffmpeg -y @inputs -filter_complex $filter -map '[outv]' -frames:v 1 -update 1 $outPath
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

New-Grid -Pair 'rm'
New-Grid -Pair 'zm'
