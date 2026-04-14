#!/bin/bash
# ============================================================
# Onboard a new doctor's images to Cloudinary
# ============================================================
#
# Usage:
#   bash scripts/onboard-doctor-images.sh <doctor-slug> <images-folder>
#
# Example:
#   bash scripts/onboard-doctor-images.sh sachin ~/Desktop/sachin-photos/
#
# The images folder should contain files named by category:
#
#   REQUIRED:
#     profile.jpg          - Doctor's headshot / profile photo
#     clinic-logo.jpg      - Clinic logo (used as favicon + nav)
#
#   OPTIONAL:
#     clinic-bg.jpg        - Hero section background (clinic exterior/interior)
#     team-photo.jpg       - Group photo of clinic staff
#     waiting-lounge.jpg   - Clinic waiting area / desk photo
#     why-choose.jpg       - Featured photo for "Why Choose" section
#     brand-logo.jpg       - Brand/sponsor logo (e.g., Invisalign)
#     iso-badge.png        - Certification badge (ISO, etc.)
#     team-<name>.jpg      - Team member photos (e.g., team-priya.jpg, team-rahul.jpg)
#     gallery-1.jpg        - Gallery/carousel images (gallery-1, gallery-2, etc.)
#
# Any file extension works (jpg, jpeg, png, webp). Cloudinary auto-converts.
# File names are case-insensitive. Spaces in filenames are fine.
#
# Environment variables (set once, reuse for all doctors):
#   CLOUDINARY_CLOUD_NAME  (required)
#   CLOUDINARY_API_KEY     (required)
#   CLOUDINARY_API_SECRET  (required)
#
# ============================================================

set -euo pipefail

CLOUD_NAME="${CLOUDINARY_CLOUD_NAME:?Set CLOUDINARY_CLOUD_NAME}"
API_KEY="${CLOUDINARY_API_KEY:?Set CLOUDINARY_API_KEY}"
API_SECRET="${CLOUDINARY_API_SECRET:?Set CLOUDINARY_API_SECRET}"

UPLOAD_URL="https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload"

# --- Args ---
DOCTOR_SLUG="${1:?Usage: bash scripts/onboard-doctor-images.sh <doctor-slug> <images-folder>}"
IMAGES_DIR="${2:?Usage: bash scripts/onboard-doctor-images.sh <doctor-slug> <images-folder>}"

if [ ! -d "$IMAGES_DIR" ]; then
  echo "ERROR: Directory not found: $IMAGES_DIR"
  exit 1
fi

# --- Helpers ---
uploaded=0
skipped=0
failed=0

upload() {
  local file="$1"
  local public_id="$2"

  echo -n "  $file -> $public_id ... "
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

  if [ "$http_code" = "200" ]; then
    echo "OK"
    uploaded=$((uploaded + 1))
  else
    local body
    body=$(echo "$response" | sed '$d')
    local msg
    msg=$(echo "$body" | grep -o '"message":"[^"]*"' | head -1 || echo "")
    echo "FAILED (HTTP $http_code) $msg"
    failed=$((failed + 1))
  fi
}

# Strip extension from filename, lowercase, replace spaces with hyphens
slug_name() {
  local name="$1"
  name="${name%.*}"                         # remove extension
  name=$(echo "$name" | tr '[:upper:]' '[:lower:]')  # lowercase
  name=$(echo "$name" | tr ' ' '-')        # spaces -> hyphens
  name=$(echo "$name" | sed 's/[^a-z0-9-]//g')       # strip special chars
  echo "$name"
}

# --- Upload ---
echo "=== Onboarding doctor: $DOCTOR_SLUG ==="
echo "    Source: $IMAGES_DIR"
echo "    Target: knocdoc/$DOCTOR_SLUG/"
echo ""

for file in "$IMAGES_DIR"/*; do
  [ -f "$file" ] || continue

  basename=$(basename "$file")
  name=$(slug_name "$basename")

  # Categorize by filename prefix/pattern
  case "$name" in
    profile*)
      upload "$file" "knocdoc/$DOCTOR_SLUG/hero/profile"
      ;;
    clinic-bg*|clinicbg*|hero-bg*)
      upload "$file" "knocdoc/$DOCTOR_SLUG/hero/clinic-bg"
      ;;
    clinic-logo*|cliniclogo*)
      upload "$file" "knocdoc/$DOCTOR_SLUG/clinic/clinic-logo"
      ;;
    team-photo*|teamphoto*|group*)
      upload "$file" "knocdoc/$DOCTOR_SLUG/clinic/team-photo"
      ;;
    waiting-lounge*|waitinglounge*|desk*|reception*)
      upload "$file" "knocdoc/$DOCTOR_SLUG/clinic/waiting-lounge"
      ;;
    why-choose*|whychoose*|featured*)
      upload "$file" "knocdoc/$DOCTOR_SLUG/clinic/why-choose"
      ;;
    brand-logo*|brandlogo*|sponsor*)
      upload "$file" "knocdoc/$DOCTOR_SLUG/hero/brand-logo"
      ;;
    iso-badge*|isobadge*|cert*)
      upload "$file" "knocdoc/$DOCTOR_SLUG/clinic/iso-badge"
      ;;
    team-*)
      # team-<name>.jpg -> knocdoc/<slug>/team/<name>
      member_name="${name#team-}"
      upload "$file" "knocdoc/$DOCTOR_SLUG/team/$member_name"
      ;;
    gallery-*|carousel-*)
      # gallery-1.jpg -> knocdoc/<slug>/gallery/1
      num="${name#gallery-}"
      num="${num#carousel-}"
      upload "$file" "knocdoc/$DOCTOR_SLUG/gallery/$num"
      ;;
    *)
      echo "  SKIP (unknown category): $basename"
      echo "        Rename to one of: profile, clinic-bg, clinic-logo, team-photo,"
      echo "        waiting-lounge, why-choose, brand-logo, iso-badge, team-<name>, gallery-<n>"
      skipped=$((skipped + 1))
      ;;
  esac
done

echo ""
echo "=== Done! ==="
echo "    Uploaded: $uploaded | Skipped: $skipped | Failed: $failed"
echo ""
echo "Verify: https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_300/knocdoc/${DOCTOR_SLUG}/hero/profile"
echo ""
echo "To use in code:"
echo "  cloudinaryUrl('knocdoc/${DOCTOR_SLUG}/hero/profile', 'w_600')"
