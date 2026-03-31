#!/usr/bin/env python3
"""Convert all .md files in GH Specialist folder to PDF"""

import sys
sys.path.insert(0, '/Users/pedro/Library/Python/3.9/lib/python/site-packages')

from fpdf import FPDF
import os
import re

class MarkdownPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.add_font('DejaVu', '', '/Users/pedro/Desktop/GH Specialist/fonts/DejaVuSans.ttf', uni=True)
        self.add_font('DejaVu', 'B', '/Users/pedro/Desktop/GH Specialist/fonts/DejaVuSans-Bold.ttf', uni=True)

    def header(self):
        self.set_font('DejaVu', 'B', 9)
        self.set_text_color(124, 77, 255)
        self.cell(0, 8, 'GH Specialist', 0, 0, 'R')
        self.ln(12)

    def footer(self):
        self.set_y(-15)
        self.set_font('DejaVu', '', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f'Página {self.page_no()}', 0, 0, 'C')

def clean_line(line):
    """Remove markdown formatting for clean text"""
    line = re.sub(r'\*\*(.*?)\*\*', r'\1', line)
    line = re.sub(r'\*(.*?)\*', r'\1', line)
    line = re.sub(r'`(.*?)`', r'\1', line)
    line = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', line)
    return line

def md_to_pdf(md_path, pdf_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    pdf = MarkdownPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    in_code_block = False
    in_table = False

    for line in lines:
        raw = line.rstrip('\n')

        # Code blocks
        if raw.strip().startswith('```'):
            in_code_block = not in_code_block
            if in_code_block:
                pdf.ln(2)
            continue

        if in_code_block:
            pdf.set_font('DejaVu', '', 9)
            pdf.set_text_color(60, 60, 60)
            pdf.set_fill_color(245, 245, 250)
            text = raw.replace('\t', '    ')
            pdf.multi_cell(0, 5, text, fill=True)
            continue

        # Empty lines
        if raw.strip() == '':
            pdf.ln(3)
            in_table = False
            continue

        # Horizontal rule
        if raw.strip() in ['---', '***', '___']:
            pdf.ln(3)
            pdf.set_draw_color(200, 200, 200)
            pdf.line(10, pdf.get_y(), 200, pdf.get_y())
            pdf.ln(5)
            continue

        clean = clean_line(raw)

        # H1
        if raw.startswith('# '):
            pdf.ln(5)
            pdf.set_font('DejaVu', 'B', 20)
            pdf.set_text_color(26, 26, 46)
            pdf.multi_cell(0, 10, clean[2:].strip())
            pdf.ln(3)
            continue

        # H2
        if raw.startswith('## '):
            pdf.ln(5)
            pdf.set_font('DejaVu', 'B', 16)
            pdf.set_text_color(124, 77, 255)
            pdf.multi_cell(0, 8, clean[3:].strip())
            pdf.ln(2)
            continue

        # H3
        if raw.startswith('### '):
            pdf.ln(3)
            pdf.set_font('DejaVu', 'B', 13)
            pdf.set_text_color(26, 26, 46)
            pdf.multi_cell(0, 7, clean[4:].strip())
            pdf.ln(1)
            continue

        # H4
        if raw.startswith('#### '):
            pdf.ln(2)
            pdf.set_font('DejaVu', 'B', 11)
            pdf.set_text_color(74, 74, 90)
            pdf.multi_cell(0, 6, clean[5:].strip())
            pdf.ln(1)
            continue

        # Tables
        if '|' in raw and raw.strip().startswith('|'):
            cells = [c.strip() for c in raw.strip().strip('|').split('|')]
            # Skip separator rows
            if all(set(c.strip()) <= set('-: ') for c in cells):
                continue

            if not in_table:
                in_table = True
                pdf.set_font('DejaVu', 'B', 9)
                pdf.set_text_color(26, 26, 46)
                pdf.set_fill_color(237, 231, 255)
            else:
                pdf.set_font('DejaVu', '', 9)
                pdf.set_text_color(60, 60, 60)
                pdf.set_fill_color(255, 255, 255)

            col_width = (pdf.w - 20) / max(len(cells), 1)
            for cell in cells:
                clean_cell = clean_line(cell)
                if len(clean_cell) > int(col_width / 2):
                    clean_cell = clean_cell[:int(col_width / 2)] + '...'
                pdf.cell(col_width, 6, clean_cell, 1, 0, 'L', True)
            pdf.ln()
            continue

        # Blockquote
        if raw.strip().startswith('>'):
            text = clean.strip().lstrip('>').strip()
            pdf.set_font('DejaVu', '', 10)
            pdf.set_text_color(124, 77, 255)
            pdf.set_fill_color(245, 243, 255)
            x = pdf.get_x()
            pdf.set_x(x + 5)
            pdf.multi_cell(pdf.w - 30, 6, text, fill=True)
            pdf.ln(1)
            continue

        # List items
        if re.match(r'^(\s*)[-*]\s', raw):
            indent = len(raw) - len(raw.lstrip())
            text = clean_line(re.sub(r'^(\s*)[-*]\s', '', raw)).strip()
            pdf.set_font('DejaVu', '', 10)
            pdf.set_text_color(60, 60, 60)
            x_offset = 15 + (indent * 3)
            pdf.set_x(x_offset)
            pdf.cell(5, 5, '•', 0, 0)
            pdf.multi_cell(pdf.w - x_offset - 15, 5, ' ' + text)
            continue

        # Numbered list
        if re.match(r'^(\s*)\d+[\.\)]\s', raw):
            match = re.match(r'^(\s*)(\d+[\.\)])\s(.*)', raw)
            if match:
                indent = len(match.group(1))
                num = match.group(2)
                text = clean_line(match.group(3))
                pdf.set_font('DejaVu', '', 10)
                pdf.set_text_color(60, 60, 60)
                x_offset = 15 + (indent * 3)
                pdf.set_x(x_offset)
                pdf.cell(8, 5, num, 0, 0)
                pdf.multi_cell(pdf.w - x_offset - 20, 5, text)
                continue

        # Checkbox
        if raw.strip().startswith('- [ ]') or raw.strip().startswith('- [x]'):
            checked = raw.strip().startswith('- [x]')
            text = clean_line(raw.strip()[5:]).strip()
            symbol = '☑' if checked else '☐'
            pdf.set_font('DejaVu', '', 10)
            pdf.set_text_color(60, 60, 60)
            pdf.set_x(15)
            pdf.cell(6, 5, symbol, 0, 0)
            pdf.multi_cell(pdf.w - 30, 5, ' ' + text)
            continue

        # Regular paragraph
        pdf.set_font('DejaVu', '', 10)
        pdf.set_text_color(60, 60, 60)
        pdf.multi_cell(0, 5, clean.strip())

    pdf.output(pdf_path)
    print(f"✅ {os.path.basename(pdf_path)}")

# Download DejaVu fonts (Unicode support)
import urllib.request

font_dir = '/Users/pedro/Desktop/GH Specialist/fonts'
os.makedirs(font_dir, exist_ok=True)

fonts = {
    'DejaVuSans.ttf': 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans.ttf',
    'DejaVuSans-Bold.ttf': 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans-Bold.ttf'
}

for fname, url in fonts.items():
    fpath = os.path.join(font_dir, fname)
    if not os.path.exists(fpath):
        print(f"Descargando {fname}...")
        urllib.request.urlretrieve(url, fpath)

# Convert all .md files
base = '/Users/pedro/Desktop/GH Specialist'
files = [
    ('GH_Website_Content.md', 'GH_Website_Content.pdf'),
    ('GH_Design_Guide.md', 'GH_Design_Guide.pdf'),
    ('GH_Blog_Strategy.md', 'GH_Blog_Strategy.pdf'),
    ('GH_Wix_Guide.md', 'GH_Wix_Guide.pdf'),
]

print("\n🔄 Convirtiendo a PDF...\n")
for md, pdf in files:
    md_path = os.path.join(base, md)
    pdf_path = os.path.join(base, pdf)
    if os.path.exists(md_path):
        try:
            md_to_pdf(md_path, pdf_path)
        except Exception as e:
            print(f"❌ Error en {md}: {e}")

print("\n✨ ¡Listo! Tus PDFs están en el escritorio en la carpeta GH Specialist")
