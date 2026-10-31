#!/bin/bash
# Upload local images to Cloudinary with correct folder structure and public IDs.
# Usage:
#   CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=yyy CLOUDINARY_API_SECRET=zzz bash scripts/upload-to-cloudinary.sh

set -euo pipefail

CLOUD_NAME="${CLOUDINARY_CLOUD_NAME:?Set CLOUDINARY_CLOUD_NAME}"
API_KEY="${CLOUDINARY_API_KEY:?Set CLOUDINARY_API_KEY}"
API_SECRET="${CLOUDINARY_API_SECRET:?Set CLOUDINARY_API_SECRET}"

UPLOAD_URL="https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload"

upload() {
  local file="$1"
  local public_id="$2"

  if [ ! -f "$file" ]; then
    echo "SKIP (not found): $file"
    return
  fi

  echo -n "Uploading $file -> $public_id ... "
  local response
  response=$(curl -s -w "\n%{http_code}" \
    -X POST "$UPLOAD_URL" \
    -u "${API_KEY}:${API_SECRET}" \
    -F "file=@${file}" \
    -F "public_id=${public_id}" \
    -F "overwrite=true" \
    -F "resource_type=image")

  local http_code
  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "200" ]; then
    echo "OK"
  else
    echo "FAILED (HTTP $http_code)"
    echo "$body" | head -3
  fi
}

echo "=== Uploading 16 images to Cloudinary (cloud: $CLOUD_NAME) ==="
echo ""

# Shared
upload "src/assets/icons/knocdocLogoWB.png"              "knocdoc/shared/knocdoc-logo-wb"

# Jasbir - Hero
upload "src/assets/images/jasbir/profile.jpg"             "knocdoc/jasbir/hero/profile"
upload "src/assets/images/jasbir/newClinicBg.jpeg"        "knocdoc/jasbir/hero/clinic-bg"
upload "src/assets/images/jasbir/InvisAlignBrand.png"     "knocdoc/jasbir/hero/invisalign-brand"

# Jasbir - Clinic
upload "src/assets/images/jasbir/ClinicLogo.jpeg"         "knocdoc/jasbir/clinic/clinic-logo"
upload "src/assets/images/jasbir/isoWBG.png"              "knocdoc/jasbir/clinic/iso-badge"
upload "src/assets/images/jasbir/doctor-photo.jpg"        "knocdoc/jasbir/clinic/team-photo"
upload "src/assets/images/jasbir/dentistdesk.jpeg"        "knocdoc/jasbir/clinic/waiting-lounge"
upload "src/assets/images/jasbir/SKP00027.JPG.jpeg"       "knocdoc/jasbir/clinic/why-choose"

# Jasbir - Team
upload "src/assets/images/jasbir/asst2.jpeg"              "knocdoc/jasbir/team/pratikshya-tripathy"
upload "src/assets/images/jasbir/Asst2close.png"          "knocdoc/jasbir/team/sidhant-nayak"
upload "src/assets/images/jasbir/RajdeepBeura.jpeg"       "knocdoc/jasbir/team/rajdeep-beura"
upload "src/assets/images/jasbir/Pooja Agrawal.jpeg"      "knocdoc/jasbir/team/pooja-agrawal"

# Jasbir - Carousel
upload "src/assets/images/carousel/SKP00008.JPG"          "knocdoc/jasbir/carousel/skp00008"
upload "src/assets/images/carousel/SKP00020.JPG"          "knocdoc/jasbir/carousel/skp00020"
upload "src/assets/images/carousel/SKP00055.JPG"          "knocdoc/jasbir/carousel/skp00055"

echo ""
echo "=== Done! ==="
echo ""
echo "Verify with: https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_300/knocdoc/jasbir/hero/profile"
