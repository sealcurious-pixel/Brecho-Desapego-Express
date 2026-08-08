import os
import glob
import subprocess

# Find directory containing Brech
items = os.listdir('.')
brecho_dir = None
for item in items:
    if 'Brech' in item and os.path.isdir(item):
        brecho_dir = item
        break

print("Found brecho_dir:", brecho_dir)

if not brecho_dir:
    brecho_dir = "Brechó"

files = [f for f in os.listdir(brecho_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
print(f"Total images found: {len(files)}")

# Create output dir
dist_dir = os.path.join('images', 'optimized')
os.makedirs(dist_dir, exist_ok=True)

# Generate PS script dynamically with explicit path to avoid encoding issues
ps_content = f"""
$srcFolder = "{os.path.abspath(brecho_dir)}"
$distFolder = "{os.path.abspath(dist_dir)}"

Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path $srcFolder -File | Where-Object {{ $_.Extension -match "\\.(jpg|jpeg|png)$" }}
Write-Host "Processing" $files.Count "files..."

$count = 0
foreach ($file in $files) {{
    $count++
    $destPath = Join-Path $distFolder $file.Name
    if (-not (Test-Path $destPath)) {{
        try {{
            $img = [System.Drawing.Image]::FromFile($file.FullName)
            $maxWidth = 800
            $maxHeight = 800
            
            $newWidth = $img.Width
            $newHeight = $img.Height
            
            if ($img.Width -gt $maxWidth -or $img.Height -gt $maxHeight) {{
                $ratioX = $maxWidth / $img.Width
                $ratioY = $maxHeight / $img.Height
                $ratio = [Math]::Min($ratioX, $ratioY)
                
                $newWidth = [int]($img.Width * $ratio)
                $newHeight = [int]($img.Height * $ratio)
            }}
            
            $bmp = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
            $graph = [System.Drawing.Graphics]::FromImage($bmp)
            $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graph.DrawImage($img, 0, 0, $newWidth, $newHeight)
            
            $encoder = [System.Drawing.Imaging.Encoder]::Quality
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]80)
            
            $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object {{ $_.MimeType -eq 'image/jpeg' }}
            
            $bmp.Save($destPath, $jpegCodec, $encoderParams)
            
            $graph.Dispose()
            $bmp.Dispose()
            $img.Dispose()
        }} catch {{
            Write-Host "Error:" $file.Name $_
        }}
    }}
    if ($count % 30 -eq 0 -or $count -eq $files.Count) {{
        Write-Host "Processed $count of $($files.Count)"
    }}
}}
Write-Host "Done optimization!"
"""

with open("temp_opt.ps1", "w", encoding="utf-8-sig") as f:
    f.write(ps_content)

print("Running temp_opt.ps1 with PowerShell...")
res = subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", "temp_opt.ps1"], capture_output=True, text=True, encoding="utf-8", errors="replace")
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
