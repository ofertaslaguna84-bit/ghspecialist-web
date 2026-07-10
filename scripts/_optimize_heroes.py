from PIL import Image
from pathlib import Path
import sys

root = Path(sys.argv[1])
max_w = int(sys.argv[2])
quality = int(sys.argv[3])

for path in sorted(root.glob('hero-*')):
    if path.suffix.lower() not in {'.jpg', '.jpeg', '.png'}:
        continue
    out = path.with_suffix('.webp')
    im = Image.open(path).convert('RGB')
    w, h = im.size
    if w > max_w:
        im = im.resize((max_w, round(h * max_w / w)), Image.LANCZOS)
    im.save(out, 'WEBP', quality=quality, method=6)
    print(f'{path.name} -> {out.name} ({out.stat().st_size // 1024} KB)')
