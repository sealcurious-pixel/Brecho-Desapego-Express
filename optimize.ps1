$srcFolder = "Brechó"
$distFolder = "images/optimized"

if (!(Test-Path $distFolder)) {
    New-Item -ItemType Directory -Force -Path $distFolder | Out-Null
}

Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path $srcFolder -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png)$" }
Write-Host "Total imagens encontradas:" $files.Count

$count = 0
foreach ($file in $files) {
    $count++
    $destPath = Join-Path $distFolder $file.Name
    if (-not (Test-Path $destPath)) {
        try {
            $img = [System.Drawing.Image]::FromFile($file.FullName)
            $maxWidth = 800
            $maxHeight = 800
            
            $newWidth = $img.Width
            $newHeight = $img.Height
            
            if ($img.Width -gt $maxWidth -or $img.Height -gt $maxHeight) {
                $ratioX = $maxWidth / $img.Width
                $ratioY = $maxHeight / $img.Height
                $ratio = [Math]::Min($ratioX, $ratioY)
                
                $newWidth = [int]($img.Width * $ratio)
                $newHeight = [int]($img.Height * $ratio)
            }
            
            $bmp = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
            $graph = [System.Drawing.Graphics]::FromImage($bmp)
            $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graph.DrawImage($img, 0, 0, $newWidth, $newHeight)
            
            $encoder = [System.Drawing.Imaging.Encoder]::Quality
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]80)
            
            $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
            
            $bmp.Save($destPath, $jpegCodec, $encoderParams)
            
            $graph.Dispose()
            $bmp.Dispose()
            $img.Dispose()
        } catch {
            Write-Host "Erro processando $($file.Name): $_"
        }
    }
    if ($count % 20 -eq 0 -or $count -eq $files.Count) {
        Write-Host "Processadas $count de $($files.Count)"
    }
}
Write-Host "Otimização concluída!"
