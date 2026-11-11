param(
  [Parameter(Mandatory = $true)][string]$JobsJsonPath
)

$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Drawing

# Compile Shell32 IShellItemImageFactory extractor for MP4 / GIF / image video posters
$src = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class ShellThumbHelper {
    [ComImport]
    [Guid("43826d1e-e718-42ee-bc55-a1e261c37bfe")]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface IShellItem {
        void BindToHandler(IntPtr pbc, [MarshalAs(UnmanagedType.LPStruct)] Guid bhid, [MarshalAs(UnmanagedType.LPStruct)] Guid riid, out IntPtr ppv);
        void GetParent(out IShellItem ppsi);
        void GetDisplayName(uint sigdnName, out IntPtr ppszName);
        void GetAttributes(uint sfgaoMask, out uint psfgaoAttribs);
        void Compare(IShellItem psi, uint hint, out int piOrder);
    }

    [ComImport]
    [Guid("bcc18b79-ba16-442f-80c4-8a59c30c463b")]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface IShellItemImageFactory {
        [PreserveSig]
        int GetImage([In, MarshalAs(UnmanagedType.Struct)] SIZE size, [In] int flags, out IntPtr phbm);
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct SIZE {
        public int cx;
        public int cy;
        public SIZE(int cx, int cy) { this.cx = cx; this.cy = cy; }
    }

    [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
    static extern void SHCreateItemFromParsingName(
        [MarshalAs(UnmanagedType.LPWStr)] string pszPath,
        IntPtr pbc,
        [MarshalAs(UnmanagedType.LPStruct)] Guid riid,
        [MarshalAs(UnmanagedType.Interface)] out IShellItem ppv);

    [DllImport("gdi32.dll")]
    static extern bool DeleteObject(IntPtr hObject);

    public static bool ExtractPoster(string srcPath, string dstPath, int size) {
        IntPtr hBitmap = IntPtr.Zero;
        try {
            Guid shellItemGuid = new Guid("43826d1e-e718-42ee-bc55-a1e261c37bfe");
            IShellItem item;
            SHCreateItemFromParsingName(srcPath, IntPtr.Zero, shellItemGuid, out item);
            var factory = (IShellItemImageFactory)item;
            int hr = factory.GetImage(new SIZE(size, size), 0x0, out hBitmap);
            if (hr != 0 || hBitmap == IntPtr.Zero) return false;
            using (var bmp = Image.FromHbitmap(hBitmap)) {
                bmp.Save(dstPath, ImageFormat.Jpeg);
            }
            return true;
        } catch {
            return false;
        } finally {
            if (hBitmap != IntPtr.Zero) DeleteObject(hBitmap);
        }
    }
}
'@

if (-not ([System.Management.Automation.PSTypeName]'ShellThumbHelper').Type) {
    Add-Type -TypeDefinition $src -ReferencedAssemblies System.Drawing
}

function Save-ResizedJpeg {
    param(
        [System.Drawing.Image]$Img,
        [string]$OutPath,
        [int]$MaxWidth,
        [int]$Quality
    )
    $w = $Img.Width
    $h = $Img.Height
    if ($w -le $MaxWidth) {
        $nw = $w
        $nh = $h
    } else {
        $nw = $MaxWidth
        $nh = [Math]::Max(1, [int][Math]::Round($h * ($MaxWidth / [double]$w)))
    }
    $bmp = New-Object System.Drawing.Bitmap($nw, $nh)
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $gfx.DrawImage($Img, 0, 0, $nw, $nh)
    $gfx.Dispose()

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
    $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
    $dir = [System.IO.Path]::GetDirectoryName($OutPath)
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $bmp.Save($OutPath, $codec, $encParams)
    $bmp.Dispose()
    return @{ w = $nw; h = $nh }
}

function Get-LqipDataUri {
    param([System.Drawing.Image]$Img)
    $lw = 24
    $lh = [Math]::Max(2, [int][Math]::Round($Img.Height * ($lw / [double]$Img.Width)))
    $bmp = New-Object System.Drawing.Bitmap($lw, $lh)
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::Bilinear
    $gfx.DrawImage($Img, 0, 0, $lw, $lh)
    $gfx.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
    $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]45)
    $bmp.Save($ms, $codec, $encParams)
    $bmp.Dispose()
    $b64 = [Convert]::ToBase64String($ms.ToArray())
    $ms.Dispose()
    return "data:image/jpeg;base64,$b64"
}

$jobs = Get-Content -LiteralPath $JobsJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$results = @()

foreach ($job in $jobs) {
    $rec = [ordered]@{ id = $job.id; kind = $job.kind; ok = $false; width = 0; height = 0; lqip = "" }
    try {
        if ($job.kind -eq 'image') {
            $img = [System.Drawing.Image]::FromFile($job.src)
            $rec.width = $img.Width
            $rec.height = $img.Height
            if ($job.thumbOut) {
                $null = Save-ResizedJpeg -Img $img -OutPath $job.thumbOut -MaxWidth 800 -Quality 84
            }
            $rec.lqip = Get-LqipDataUri -Img $img
            $img.Dispose()
            $rec.ok = $true
        } elseif ($job.kind -eq 'videoPoster') {
            $dir = [System.IO.Path]::GetDirectoryName($job.posterOut)
            if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
            $ok = [ShellThumbHelper]::ExtractPoster($job.src, $job.posterOut, 1280)
            if ($ok -and (Test-Path -LiteralPath $job.posterOut)) {
                $pimg = [System.Drawing.Image]::FromFile($job.posterOut)
                $rec.width = $pimg.Width
                $rec.height = $pimg.Height
                if ($job.thumbOut) {
                    $null = Save-ResizedJpeg -Img $pimg -OutPath $job.thumbOut -MaxWidth 800 -Quality 84
                }
                $rec.lqip = Get-LqipDataUri -Img $pimg
                $pimg.Dispose()
                $rec.ok = $true
            }
        }
    } catch {
        $rec.error = $_.Exception.Message
    }
    $results += [PSCustomObject]$rec
}

$results | ConvertTo-Json -Depth 4 -Compress | Out-File -FilePath ($JobsJsonPath + '.out.json') -Encoding UTF8

