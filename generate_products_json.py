import os
import json
import random

# Find directory containing Brech
items = os.listdir('.')
brecho_dir = None
for item in items:
    if 'Brech' in item and os.path.isdir(item):
        brecho_dir = item
        break

if not brecho_dir:
    brecho_dir = "Brechó"

image_files = sorted([f for f in os.listdir(brecho_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])

# Filter out duplicate (1) files to avoid showing identical items twice, or treat them as secondary/alternative views
unique_items = []
seen_bases = set()

for img in image_files:
    # If file has (1), check if base without (1) exists
    clean_name = img.replace("(1)", "")
    if "(1)" in img and clean_name in image_files:
        continue # skip duplicate photo
    unique_items.append(img)

print(f"Total unique images selected: {len(unique_items)}")

# Pre-defined boho product templates to assign realistic & poetic vintage titles/descriptions
categories = ['Blusas', 'Vestidos', 'Calças', 'Saias', 'Casacos', 'Acessórios']
sizes = ['PP', 'P', 'M', 'G', 'GG', 'Único', '36', '38', '40', '42', '44']
badges = ['Garimpo Único', 'Destaque Boho', 'Achadinho', 'Favorito do Mês', 'Vintage Raiz', None, None, None]
conditions = ['Excelente estado', 'Seminovo de acervo', 'Vintage impecável', 'Garimpo sustentável']

product_names = {
    'Blusas': [
        'Blusa Ciganinha de Algodão Terroso', 'Bata Boho Bordada à Mão', 'Camisa Vintage Floral Suave',
        'Regata de Linho Bege Natural', 'Cropped Tricô Artesanal', 'Blusa Manga Buff Terracota',
        'Top Estampa Étnica Boemia', 'Camisa Jeans Leve Garimpo', 'Blusa Gola Alta Verde Oliva',
        'Bata Floral Soltinha', 'Camiseta Vintage Retrô 90s', 'Túnica Artesanal com Franjas'
    ],
    'Vestidos': [
        'Vestido Longo Boho Floral', 'Vestido Midi Linho Terracota', 'Vestido Soltinho Estampa Botânica',
        'Vestido Vintage Ciganinha', 'Vestido Midi Verde Oliva', 'Vestido Envelope Algodão Doce',
        'Vestido Vintage Botões Madeira', 'Vestido Evasê Estampa Étnica', 'Vestido Camisie Retrô'
    ],
    'Calças': [
        'Calça Pantalona Linho Bege', 'Calça Jeans Vintage Cintura Alta', 'Calça Pantacourt Terracota',
        'Calça Alfaiataria Retrô Verde Oliva', 'Calça Flare Estampa Boho', 'Calça Wide Leg Garimpo'
    ],
    'Saias': [
        'Saia Midi Plissada Mostarda', 'Saia Longa Floral Boho', 'Saia Botões Frontais Linho',
        'Saia Evasê Estampa Botânica', 'Saia Jeans Garimpo Vintage', 'Saia Envelope Terracota'
    ],
    'Casacos': [
        'Kimono Boho Floral Franjas', 'Cardigan Tricô Oversized Café', 'Jaqueta Jeans Garimpo Vintage',
        'Colete Bordado Estilo Étnico', 'Blazer Alfaiataria Retrô', 'Casaco Leve Verde Oliva'
    ],
    'Acessórios': [
        'Bolsa de Crochê Artesanal', 'Lenço de Seda Estampa Vintage', 'Bolsa de Palha Boho Chic',
        'Cinto de Couro Vintage Fivela Trabalhada', 'Chapéu de Palha Abas Largas', 'Colar Artesanal Pedras Naturais'
    ]
}

descriptions = [
    "Garimpo exclusivo selecionado a dedo para quem ama estilo único e consumo consciente.",
    "Peça vintage cheia de história, tecido extremamente confortável e acabamento impecável.",
    "Modelo super coringa e atemporal, perfeito para compor looks boho chic no dia a dia.",
    "Tecido leve, toque suave e caimento fluido. Uma preciosidade da moda circular.",
    "Garimpo artesanal em perfeitas condições, sem marcas de uso. Edição única!"
]

# Random seed for consistent generated catalog
random.seed(42)

products = []

for idx, img_name in enumerate(unique_items, start=1):
    cat = categories[idx % len(categories)]
    title_option = product_names[cat][idx % len(product_names[cat])]
    # Add index variant to make title unique
    title = f"{title_option} #{idx}"
    
    # Prices strictly between R$ 5,00 and R$ 50,00
    price_options = [5.0, 10.0, 12.0, 15.0, 18.0, 20.0, 22.0, 25.0, 28.0, 30.0, 32.0, 35.0, 38.0, 40.0, 42.0, 45.0, 48.0, 50.0]
    price = price_options[idx % len(price_options)]
    
    size = sizes[idx % len(sizes)]
    badge = badges[idx % len(badges)]
    condition = conditions[idx % len(conditions)]
    desc = descriptions[idx % len(descriptions)]
    
    prod = {
        "id": f"prod-{idx:03d}",
        "title": title,
        "category": cat,
        "price": price,
        "size": size,
        "badge": badge,
        "condition": condition,
        "description": desc,
        "image": f"images/optimized/{img_name}",
        "originalImage": f"{brecho_dir}/{img_name}"
    }
    products.append(prod)

os.makedirs('js', exist_ok=True)
with open('js/products.js', 'w', encoding='utf-8') as f:
    f.write(f"const PRODUCTS_DATA = {json.dumps(products, ensure_ascii=False, indent=2)};\n")

print(f"Successfully generated js/products.js with {len(products)} items.")
