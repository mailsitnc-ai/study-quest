"""Draws the Study Quest app icon (shield + sword on a deep-purple tile) and builds icon.icns."""
import math, os, subprocess
from PIL import Image, ImageDraw, ImageFilter

S = 2048          # draw big, downscale for smooth edges
here = os.path.dirname(os.path.abspath(__file__))

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def gradient(size, c1, c2, angle=135):
    w, h = size
    g = Image.new("RGB", size)
    px = g.load()
    ca, sa = math.cos(math.radians(angle)), math.sin(math.radians(angle))
    mx = abs(w * ca) + abs(h * sa)
    for y in range(h):
        for x in range(w):
            t = ((x - w / 2) * ca + (y - h / 2) * sa) / mx + .5
            px[x, y] = lerp(c1, c2, max(0, min(1, t)))
    return g

# --- rounded tile (macOS icon grid: art sits inside ~80% of the canvas)
pad = int(S * .098)
tile = (pad, pad, S - pad, S - pad)
radius = int((S - 2 * pad) * .225)
bg = gradient((S, S), (74, 38, 170), (9, 8, 40), 125)
glow = Image.new("RGB", (S, S), (0, 0, 0))
ImageDraw.Draw(glow).ellipse((S * .18, S * .05, S * .82, S * .62), fill=(120, 80, 255))
glow = glow.filter(ImageFilter.GaussianBlur(S * .12))
bg = Image.blend(bg, Image.composite(glow, bg, Image.new("L", (S, S), 255)), .35)
mask = Image.new("L", (S, S), 0)
ImageDraw.Draw(mask).rounded_rectangle(tile, radius, fill=255)
icon = Image.new("RGBA", (S, S), (0, 0, 0, 0))
icon.paste(bg, (0, 0), mask)

# --- shield
cx = S // 2
top, bot = int(S * .24), int(S * .80)
w = int(S * .27)
def shield_pts(scale=1.0, dy=0):
    pts = []
    for i in range(0, 101):                      # right side curve, top -> tip
        t = i / 100
        x = cx + w * scale * (1 - t ** 2.2) * (1 if t < .999 else 0)
        y = top + dy + (bot - top) * (t ** 1.0)
        # flatten the top edge
        pts.append((x, y))
    left = [(2 * cx - x, y) for x, y in reversed(pts)]
    return [(cx - w * scale, top + dy)] + pts + left[1:] + [(cx + w * scale, top + dy)]
sh = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(sh)
d.polygon(shield_pts(1.0), fill=(255, 214, 90, 255))                 # gold rim
d.polygon(shield_pts(.88, int(S * .018)), fill=(40, 22, 120, 255))   # inner navy
g = gradient((S, S), (90, 60, 220), (30, 20, 100), 100).convert("RGBA")
inner = Image.new("L", (S, S), 0); ImageDraw.Draw(inner).polygon(shield_pts(.84, int(S * .026)), fill=255)
sh.paste(g, (0, 0), inner)
# drop shadow + glow
shadow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
ImageDraw.Draw(shadow).polygon(shield_pts(1.0, int(S * .02)), fill=(0, 0, 0, 150))
shadow = shadow.filter(ImageFilter.GaussianBlur(S * .02))
icon = Image.alpha_composite(icon, shadow)
icon = Image.alpha_composite(icon, sh)

# --- sword (vertical, steel) with golden guard
bl = ImageDraw.Draw(icon)
blade_top, blade_bot = int(S * .27), int(S * .62)
bw = int(S * .035)
blade = [(cx, blade_top - int(S * .035)), (cx + bw, blade_top + int(S * .03)), (cx + bw, blade_bot), (cx - bw, blade_bot), (cx - bw, blade_top + int(S * .03))]
bl.polygon(blade, fill=(236, 240, 255, 255))
bl.polygon([(cx, blade_top - int(S * .035)), (cx + bw, blade_top + int(S * .03)), (cx + bw, blade_bot), (cx, blade_bot)], fill=(190, 200, 235, 255))
bl.rounded_rectangle((cx - int(S * .115), blade_bot, cx + int(S * .115), blade_bot + int(S * .035)), int(S * .017), fill=(255, 214, 90, 255))
bl.rectangle((cx - int(S * .02), blade_bot + int(S * .035), cx + int(S * .02), blade_bot + int(S * .1)), fill=(150, 90, 40, 255))
bl.ellipse((cx - int(S * .035), blade_bot + int(S * .09), cx + int(S * .035), blade_bot + int(S * .16)), fill=(255, 214, 90, 255))

# --- sparkle stars
def star(x, y, r, col=(255, 255, 255, 235)):
    pts = []
    for i in range(8):
        a = math.pi / 4 * i - math.pi / 2
        rr = r if i % 2 == 0 else r * .28
        pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    bl.polygon(pts, fill=col)
star(int(S * .73), int(S * .25), int(S * .05)); star(int(S * .27), int(S * .33), int(S * .032)); star(int(S * .70), int(S * .44), int(S * .022))

# tile border highlight
ImageDraw.Draw(icon).rounded_rectangle(tile, radius, outline=(255, 255, 255, 60), width=int(S * .004))
icon = icon.resize((1024, 1024), Image.LANCZOS)
icon.save(os.path.join(here, "icon-1024.png"))

# --- build the .icns
iconset = os.path.join(here, "icon.iconset")
os.makedirs(iconset, exist_ok=True)
for base in (16, 32, 128, 256, 512):
    icon.resize((base, base), Image.LANCZOS).save(os.path.join(iconset, f"icon_{base}x{base}.png"))
    icon.resize((base * 2, base * 2), Image.LANCZOS).save(os.path.join(iconset, f"icon_{base}x{base}@2x.png"))
subprocess.run(["iconutil", "-c", "icns", iconset, "-o", os.path.join(here, "icon.icns")], check=True)
print("icon.icns written")
