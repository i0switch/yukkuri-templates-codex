param(
  [ValidateSet('rm', 'zm', 'all')]
  [string]$Target = 'all'
)

$ErrorActionPreference = 'Stop'

$pairs = switch ($Target) {
  'rm' { @('rm') }
  'zm' { @('zm') }
  default { @('rm', 'zm') }
}

foreach ($pair in $pairs) {
  foreach ($id in @('01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','20','21','22')) {
    Write-Host "Rendering scene-$id-$pair.png"
    npm run "render:$id-$pair"
    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }
  }
}
