"""Generate PWA icons for Solaren - مدرن با حرف S سفید روی خورشید."""
from PIL import Image, ImageDraw
import os
import math

OUT_DIR = '/home/user/solar-estimator/assets/icons'
os.makedirs(OUT_DIR, exist_ok=True)

# Solaren Brand Palette
BG_TOP = (28, 42, 77)        # آبی تیره
BG_BOT = (6, 9, 18)          # خیلی تیره
SUN_C = (253, 230, 138)      # زرد روشن
SUN_M = (251, 191, 36)       # طلایی
SUN_E = (249, 115, 22)       # نارنجی
SUN_RAY = (253, 224, 71)     # پرتوها


def create_solaren_icon(size, maskable=False):
    """تولید آیکون مدرن Solaren با حرف S سفید روی خورشید طلایی"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))

    # Padding برای maskable
    padding = 0 if maskable else int(size * 0.05)
    bg_box = [padding, padding, size - padding, size - padding]
    radius = int((size - padding * 2) * 0.22)

    # پس‌زمینه گرادیانت
    bg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    for y in range(size):
        t = y / size
        r = int(BG_TOP[0] * (1 - t) + BG_BOT[0] * t)
        g = int(BG_TOP[1] * (1 - t) + BG_BOT[1] * t)
        b = int(BG_TOP[2] * (1 - t) + BG_BOT[2] * t)
        bg_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    # گوشه‌های گرد
    rounded = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(bg_box, radius=radius, fill=255)
    rounded.paste(bg, (0, 0), mask)
    img = rounded
    draw = ImageDraw.Draw(img)

    # پرتوهای خورشید (۸ عدد)
    cx, cy = size / 2, size * 0.45
    sun_r = size * 0.16
    ray_inner = sun_r * 1.35
    ray_outer = sun_r + size * 0.22
    ray_w = max(2, int(size * 0.025))
    for i in range(8):
        angle = i * (math.pi / 4) - math.pi / 2
        x1 = cx + math.cos(angle) * ray_inner
        y1 = cy + math.sin(angle) * ray_inner
        x2 = cx + math.cos(angle) * ray_outer
        y2 = cy + math.sin(angle) * ray_outer
        draw.line([(x1, y1), (x2, y2)], fill=SUN_RAY, width=ray_w)

    # بدنه خورشید با گرادیانت
    sun_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sun_img)
    for r in range(int(sun_r), 0, -1):
        t = r / sun_r
        if t < 0.5:
            cr = int(SUN_M[0] * (1 - t * 2) + SUN_C[0] * t * 2)
            cg = int(SUN_M[1] * (1 - t * 2) + SUN_C[1] * t * 2)
            cb = int(SUN_M[2] * (1 - t * 2) + SUN_C[2] * t * 2)
        else:
            cr = int(SUN_E[0] * ((t - 0.5) * 2) + SUN_M[0] * (1 - (t - 0.5) * 2))
            cg = int(SUN_E[1] * ((t - 0.5) * 2) + SUN_M[1] * (1 - (t - 0.5) * 2))
            cb = int(SUN_E[2] * ((t - 0.5) * 2) + SUN_M[2] * (1 - (t - 0.5) * 2))
        sd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(cr, cg, cb, 255))
    img.alpha_composite(sun_img)

    # حرف S سفید - مدرن
    s_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(s_img)
    s_w = max(3, int(size * 0.06))   # ضخامت خط
    s_h = sun_r * 0.85               # ارتفاع
    cx_s = cx
    cy_s = cy

    # رسم S با منحنی سفید
    # نیمه بالایی S (از بالا چپ به راست پایین)
    p1 = (cx_s - s_h * 0.5, cy_s - s_h * 0.6)
    p2 = (cx_s + s_h * 0.5, cy_s - s_h * 0.6)
    p3 = (cx_s + s_h * 0.5, cy_s)
    p4 = (cx_s - s_h * 0.5, cy_s)
    p5 = (cx_s - s_h * 0.5, cy_s + s_h * 0.6)
    p6 = (cx_s + s_h * 0.5, cy_s + s_h * 0.6)

    # خط اصلی S
    points = [
        (cx_s + s_h * 0.4, cy_s - s_h * 0.6),  # بالا راست
        (cx_s - s_h * 0.4, cy_s - s_h * 0.6),  # بالا چپ
        (cx_s - s_h * 0.4, cy_s),              # میان چپ
        (cx_s + s_h * 0.4, cy_s),              # میان راست
        (cx_s + s_h * 0.4, cy_s + s_h * 0.6),  # پایین راست
        (cx_s - s_h * 0.4, cy_s + s_h * 0.6),  # پایین چپ
    ]
    sd.line(points, fill=(255, 255, 255, 255), width=s_w, joint='curve')

    img.alpha_composite(s_img)

    # نوار پایین - متن Solaren یا فقط نوار رنگی
    # یه خط افقی زیبا پایین
    line_y = int(size * 0.82)
    line_w = int(size * 0.35)
    line_x = (size - line_w) // 2
    draw = ImageDraw.Draw(img)
    # گرادیانت افقی
    for x in range(line_x, line_x + line_w):
        t = (x - line_x) / line_w
        r = int(SUN_M[0] * (1 - t * 0.3))
        g = int(SUN_M[1] * (1 - t * 0.2))
        b = int(SUN_M[2] * (1 - t * 0.1))
        draw.line([(x, line_y), (x, line_y + max(1, int(size * 0.008)))], fill=(r, g, b, 255))

    return img


# تولید همه سایزها
for size, maskable, fn in [
    (72, False, 'icon-72.png'),
    (96, False, 'icon-96.png'),
    (128, False, 'icon-128.png'),
    (144, False, 'icon-144.png'),
    (152, False, 'icon-152.png'),
    (192, True, 'icon-192.png'),
    (384, False, 'icon-384.png'),
    (512, True, 'icon-512.png')
]:
    create_solaren_icon(size, maskable).save(os.path.join(OUT_DIR, fn), 'PNG', optimize=True)
    print(f"Created: {fn}")

create_solaren_icon(64, False).save('/home/user/solar-estimator/assets/favicon.png', 'PNG', optimize=True)
create_solaren_icon(180, False).save('/home/user/solar-estimator/assets/apple-touch-icon.png', 'PNG', optimize=True)
print("✅ All Solaren icons generated")
