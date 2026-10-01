"""Centre single-component Storybook shots on a 2880 x 1800 frame in the canvas colour."""
import glob, os
from PIL import Image

FRAME = (2880, 1800)
FILL = 0.72  # the component takes at most this share of the frame
BG = (230, 234, 231)  # Storybook canvas behind the stories

for path in glob.glob('shots/storybook/raw/*.png'):
    comp = Image.open(path).convert('RGBA')
    scale = min(FRAME[0] * FILL / comp.width, FRAME[1] * FILL / comp.height)
    comp = comp.resize((round(comp.width * scale), round(comp.height * scale)), Image.LANCZOS)
    frame = Image.new('RGBA', FRAME, BG + (255,))
    frame.alpha_composite(comp, ((FRAME[0] - comp.width) // 2, (FRAME[1] - comp.height) // 2))
    frame.convert('RGB').save(os.path.join('shots/storybook', os.path.basename(path)))
