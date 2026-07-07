"""
Génère les icônes PWA/favicon et l'image Open Graph à partir de la palette
du site (vert forêt -> bleu profond). Nécessite Pillow + numpy.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

INK = (10, 13, 11)
CANOPY = (63, 157, 110)
DUSK = (76, 127, 192)
MIST = (244, 246, 244)
TEXT_ON_ACCENT = (4, 20, 11)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def diagonal_gradient(size, c1, c2):
    """Dégradé linéaire diagonal (haut-gauche -> bas-droite) en RGB."""
    w, h = size
    x = np.linspace(0, 1, w)
    y = np.linspace(0, 1, h)
    xx, yy = np.meshgrid(x, y)
    t = np.clip((xx + yy) / 2, 0, 1)
    c1 = np.array(c1, dtype=np.float32)
    c2 = np.array(c2, dtype=np.float32)
    grad = (c1[None, None, :] * (1 - t[:, :, None]) + c2[None, None, :] * t[:, :, None]).astype(np.uint8)
    return Image.fromarray(grad, mode="RGB")


def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=radius, fill=255)
    return mask


def make_mark(size, rounded=True, safe_zone_scale=1.0):
    """Carré dégradé + monogramme CP. safe_zone_scale < 1 pour les icônes maskables."""
    img = diagonal_gradient((size, size), CANOPY, DUSK).convert("RGBA")

    if rounded:
        mask = rounded_mask((size, size), radius=int(size * 0.22))
        bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        bg.paste(img, (0, 0), mask)
        img = bg
    else:
        base = Image.new("RGBA", (size, size), INK + (255,))
        base.alpha_composite(img)
        img = base

    draw = ImageDraw.Draw(img)
    font_size = int(size * 0.40 * safe_zone_scale)
    font = ImageFont.truetype(FONT_BOLD, font_size)
    text = "CP"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pos = ((size - tw) / 2 - bbox[0], (size - th) / 2 - bbox[1])
    draw.text(pos, text, font=font, fill=TEXT_ON_ACCENT + (255,))
    return img


def save_png(img, path, size):
    img.resize((size, size), Image.LANCZOS).save(path, "PNG")


def generate_favicon_ico(mark_1024, path):
    sizes = [16, 32, 48]
    imgs = [mark_1024.resize((s, s), Image.LANCZOS) for s in sizes]
    imgs[0].save(path, format="ICO", sizes=[(s, s) for s in sizes], append_images=imgs[1:])


def generate_og_image(path):
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), INK)
    draw = ImageDraw.Draw(img)

    # Lignes topographiques discrètes en fond
    rng = np.random.default_rng(7)
    for i in range(6):
        y0 = 80 + i * 90 + rng.integers(-15, 15)
        pts = []
        for x in range(-50, w + 50, 40):
            y = y0 + 18 * np.sin(x / 140 + i) + rng.integers(-6, 6)
            pts.append((x, y))
        draw.line(pts, fill=(255, 255, 255, 20), width=1, joint="curve")

    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    for i in range(6):
        y0 = 80 + i * 90
        pts = []
        for x in range(-50, w + 50, 40):
            y = y0 + 18 * np.sin(x / 140 + i)
            pts.append((x, y))
        odraw.line(pts, fill=(255, 255, 255, 22), width=1, joint="curve")
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    mark = make_mark(120, rounded=True)
    img.paste(mark, (90, 90), mark)

    name_font = ImageFont.truetype(FONT_BOLD, 64)
    title_font = ImageFont.truetype(FONT_REGULAR, 30)

    draw.text((90, 240), "Camille Perraudeau", font=name_font, fill=MIST)
    draw.text((90, 320), "Technicien forestier & Développeur SIG / IA", font=title_font, fill=(155, 170, 156))
    draw.text((90, 370), "GeoSylva Intelligence Engine (GSIE)", font=title_font, fill=(87, 194, 135))

    img.save(path, "PNG")


if __name__ == "__main__":
    import os
    icons_dir = "/home/claude/site/assets/icons"
    img_dir = "/home/claude/site/assets/img"
    os.makedirs(icons_dir, exist_ok=True)
    os.makedirs(img_dir, exist_ok=True)

    mark_1024 = make_mark(1024, rounded=True)
    save_png(mark_1024, f"{icons_dir}/icon-512.png", 512)
    save_png(mark_1024, f"{icons_dir}/icon-192.png", 192)
    save_png(mark_1024, f"{icons_dir}/apple-touch-icon.png", 180)

    maskable = make_mark(1024, rounded=False, safe_zone_scale=0.62)
    save_png(maskable, f"{icons_dir}/icon-maskable-512.png", 512)

    generate_favicon_ico(mark_1024.convert("RGB"), "/home/claude/site/favicon.ico")

    generate_og_image(f"{img_dir}/og-image.png")

    print("Icônes générées avec succès.")
