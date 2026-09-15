$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$UploadRoot = Join-Path $ProjectRoot "public\uploads"

function Save-RemoteImage {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$RelativePath
    )

    $Target = Join-Path $UploadRoot ($RelativePath -replace '/', '\')
    $Directory = Split-Path $Target -Parent
    New-Item -ItemType Directory -Force -Path $Directory | Out-Null

    Write-Host "Downloading $RelativePath"
    Invoke-WebRequest `
        -Uri $Url `
        -OutFile $Target `
        -UseBasicParsing `
        -MaximumRedirection 10 `
        -Headers @{ "User-Agent" = "Mozilla/5.0" }
}

$Images = @(
    @{
        Path = "products/catalog/signature-18k-gold-jewellery-set-1.jpg"
        Url  = "https://jeafuafahcylgooeapkj.supabase.co/storage/v1/object/public/products/hq/20260914/signature-18k-gold-jewellery-set.jpg"
    },
    @{
        Path = "products/catalog/signature-18k-gold-jewellery-set-2.jpg"
        Url  = "https://images.unsplash.com/photo-1768845431893-8e28ed7bf79e?auto=format&fit=crop&fm=jpg&q=85&w=1800"
    },
    @{
        Path = "products/catalog/21k-gold-long-necklace-1.jpg"
        Url  = "https://jeafuafahcylgooeapkj.supabase.co/storage/v1/object/public/products/hq/20260914/21k-gold-long-necklace.jpg"
    },
    @{
        Path = "products/catalog/21k-gold-long-necklace-2.jpg"
        Url  = "https://images.unsplash.com/photo-1758995115785-d13726ac93f0?auto=format&fit=crop&fm=jpg&q=85&w=1800"
    },
    @{
        Path = "products/catalog/floral-gold-necklace-set-1.jpg"
        Url  = "https://jeafuafahcylgooeapkj.supabase.co/storage/v1/object/public/products/hq/20260914/floral-gold-necklace-set.jpg"
    },
    @{
        Path = "products/catalog/floral-gold-necklace-set-2.jpg"
        Url  = "https://images.unsplash.com/photo-1670541481909-0b2c047fb45a?auto=format&fit=crop&fm=jpg&q=85&w=1800"
    },
    @{
        Path = "products/catalog/classic-gold-diamond-ring-1.jpg"
        Url  = "https://images.unsplash.com/photo-1677466891887-9cf7762d64cc?auto=format&fit=crop&fm=jpg&q=85&w=1800"
    },
    @{
        Path = "products/catalog/classic-gold-diamond-ring-2.jpg"
        Url  = "https://images.unsplash.com/photo-1610109108120-7aeac1ae2c1f?auto=format&fit=crop&fm=jpg&q=85&w=1800"
    },
    @{
        Path = "products/catalog/elegant-gold-bangle-bracelet-1.jpg"
        Url  = "https://images.unsplash.com/photo-1741071520904-37ef3c0fea09?auto=format&fit=crop&fm=jpg&q=85&w=1800"
    },
    @{
        Path = "products/catalog/elegant-gold-bangle-bracelet-2.jpg"
        Url  = "https://images.unsplash.com/photo-1573446238824-c28afa0cd312?auto=format&fit=crop&fm=jpg&q=85&w=1800"
    },
    @{
        Path = "products/catalog/gold-drop-earrings-1.jpg"
        Url  = "https://images.unsplash.com/photo-1705326454933-9685fc6888e1?auto=format&fit=crop&fm=jpg&q=85&w=1800"
    },
    @{
        Path = "products/catalog/gold-drop-earrings-2.jpg"
        Url  = "https://images.unsplash.com/photo-1721103418236-3e314539f849?auto=format&fit=crop&fm=jpg&q=85&w=1800"
    },
    @{
        Path = "products/catalog/diamond-drop-necklace-set-1.jpg"
        Url  = "https://jeafuafahcylgooeapkj.supabase.co/storage/v1/object/public/products/hq/20260914/diamond-drop-necklace-set.jpg"
    },
    @{
        Path = "products/catalog/diamond-drop-necklace-set-2.jpg"
        Url  = "https://images.unsplash.com/photo-1706602019564-79da651fba0a?auto=format&fit=crop&fm=jpg&q=85&w=1800"
    },
    @{
        Path = "site-assets/logo/logo.png"
        Url  = "https://jeafuafahcylgooeapkj.supabase.co/storage/v1/object/public/site-assets/logo/1789380536615.png"
    },
    @{
        Path = "site-assets/home_hero/home-hero.jpg"
        Url  = "https://images.unsplash.com/photo-1758995115785-d13726ac93f0?auto=format&fit=crop&fm=jpg&q=85&w=2400"
    },
    @{
        Path = "site-assets/about_image/about.jpg"
        Url  = "https://jeafuafahcylgooeapkj.supabase.co/storage/v1/object/public/site-assets/about_image/premium-1789380954734.jpg"
    }
)

New-Item -ItemType Directory -Force -Path $UploadRoot | Out-Null

foreach ($Image in $Images) {
    Save-RemoteImage -Url $Image.Url -RelativePath $Image.Path
}

Write-Host ""
Write-Host "Image migration completed: $UploadRoot" -ForegroundColor Green
Write-Host "Files downloaded: $($Images.Count)" -ForegroundColor Green
