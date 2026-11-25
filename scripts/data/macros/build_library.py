"""Builds data/macros-library.json. Edit values here, then run from the repo root: python3 scripts/data/macros/build_library.py"""
import json

AS_OF = "2026-11-24"

# per_100: values per 100 g (or 100 ml) as sold. carbs_g = total carbohydrate incl. fibre.
# price: pack size in g/ml and selling price (INR) seen online; cost scales linearly.
items = [
    # ---------- Dairy & soy proteins ----------
    dict(id="milky_mist_hp_low_fat_paneer", name="High Protein Low Fat Paneer", brand="Milky Mist",
         category="dairy_protein", serving=100, unit="g", form="raw",
         per_100=dict(kcal=189.8, protein_g=25.0, carbs_g=6.7, fat_g=7.0, fibre_g=0.0),
         pack=200, price=109, mrp=160, price_src="BigBasket listing",
         confidence="high",
         source="Pack label (your photo): per 100 g 189.8 kcal, 25 g P, 7 g fat, 6.7 g carbs (5.7 g milk sugar)",
         notes=""),
    dict(id="amul_malai_paneer", name="Malai Paneer", brand="Amul",
         category="dairy_protein", serving=100, unit="g", form="raw",
         per_100=dict(kcal=323, protein_g=20.0, carbs_g=4.5, fat_g=25.0, fibre_g=0.0),
         pack=200, price=85.5, mrp=99, price_src="BigBasket listing",
         confidence="high", source="amul.com product page (official label)",
         notes="BigBasket's 'Fresh Malai Paneer' label shows 312 kcal / 24 g fat — near-identical."),
    dict(id="amul_taaza_milk", name="Taaza Toned Milk", brand="Amul",
         category="dairy", serving=200, unit="ml", form="raw",
         per_100=dict(kcal=58, protein_g=3.0, carbs_g=4.8, fat_g=3.0, fibre_g=0.0),
         pack=500, price=31, mrp=31, price_src="500 ml pouch after the 12 Nov 2026 ₹2/L hike (₹29→30 in May, +₹1 in Nov); city-dependent",
         confidence="high", source="amul.com Taaza UHT page / Dudhsagar Dairy label (per 100 ml)",
         notes="Carbs are milk sugar (lactose), no added sugar."),
    dict(id="amul_masti_dahi", name="Masti Dahi", brand="Amul",
         category="dairy", serving=200, unit="g", form="raw",
         per_100=dict(kcal=65, protein_g=4.0, carbs_g=4.6, fat_g=3.1, fibre_g=0.0),
         pack=400, price=45, mrp=45, price_src="BigBasket 400 g cup (1 kg pouch is cheaper at ~₹77)",
         confidence="high", source="Zepto/BigBasket label (per 100 g)",
         notes=""),
    dict(id="soya_chunks_fortune", name="Soya Chunks", brand="Fortune (Nutrela is near-identical)",
         category="soy_protein", serving=50, unit="g", form="dry",
         per_100=dict(kcal=345, protein_g=52.0, carbs_g=33.0, fat_g=0.5, fibre_g=13.0),
         pack=1000, price=163, mrp=169, price_src="Flipkart 1 kg",
         confidence="high", source="Fortune label (via Sastasundar): 345 kcal, 52 g P, 13 g dietary fibre",
         notes="Nutrela lists ~53 g protein, 354 kcal per 100 g."),
    dict(id="hello_tempayy_crumbles", name="Simply Natural Tempeh Crumbles", brand="Hello Tempayy",
         category="soy_protein", serving=100, unit="g", form="raw",
         per_100=dict(kcal=178, protein_g=21.0, carbs_g=10.1, fat_g=6.8, fibre_g=8.5),
         pack=200, price=144.69, mrp=159, price_src="BigBasket 200 g",
         confidence="high", source="Pack label (your photo): 178 kcal, 21 g P, 6.8 g fat, 10.1 g carbs, 8.5 g fibre per 100 g",
         notes="Also has iron 8.8 mg and B12 1.1 µg per 100 g."),
    dict(id="mooz_tofu", name="Fresh & Firm Organic Tofu", brand="Mooz",
         category="soy_protein", serving=100, unit="g", form="raw",
         per_100=dict(kcal=140, protein_g=14.2, carbs_g=4.5, fat_g=2.9, fibre_g=0.5),
         pack=200, price=104, mrp=110, price_src="BigBasket 200 g",
         confidence="medium", source="BigBasket label (140 kcal, 14.19 g P, 4.5 g C, 2.89 g F)",
         notes="Label kcal is higher than its own macros imply (~101 kcal). Fibre not on label (estimate). Reviewers report packs can weigh ~160 g after draining."),
    dict(id="hello_tempayy_momos_peri_peri", name="Peri Peri High Protein Veg Momos", brand="Hello Tempayy",
         category="soy_protein", serving=100, unit="g", form="cooked",
         per_100=dict(kcal=211, protein_g=10.7, carbs_g=28.3, fat_g=6.0, fibre_g=0.0),
         pack=210, price=118.95, mrp=195, price_src="BigBasket 10 pcs (pack = 2.5 × 84 g ≈ 210 g)",
         confidence="high", source="Pack label (your photo): per 100 g 211 kcal, 10.7 g P, 6 g fat, 28.3 g carbs",
         notes="Fibre not on label (counted as 0). Pack serving is 84 g (~4 pieces). Dipping sauce not tracked."),
    dict(id="amul_diced_cheese_blend", name="Diced Cheese Blend (Mozzarella & Cheddar)", brand="Amul",
         category="dairy", serving=100, unit="g", form="raw",
         per_100=dict(kcal=289, protein_g=23.0, carbs_g=2.0, fat_g=21.0, fibre_g=0.0),
         pack=200, price=120, mrp=120, price_src="BigBasket 200 g pouch (1 kg pouch ~₹501)",
         confidence="high", source="Pack label (your photo): 289 kcal, 23 g P, 21 g fat, 2 g carbs per 100 g",
         notes="Sodium 400 mg per 100 g."),
    dict(id="myprotein_impact_whey_choc_smooth", name="Impact Whey Protein – Chocolate Smooth", brand="Myprotein",
         category="supplement", serving=30, unit="g", form="raw", serving_label="1 scoop (30 g)",
         per_100=dict(kcal=383.6, protein_g=73.68, carbs_g=8.0, fat_g=6.32, fibre_g=0.0),
         pack=1000, price=3370, mrp=4999, price_src="Flipkart 1 kg (Myprotein runs frequent sales)",
         confidence="high", source="myprotein.co.in product page, Chocolate Smooth (30 g scoop: 115 kcal, 22.1 g P)",
         notes="Older India packs used a 25 g scoop (98 kcal, 19 g P). Check your scoop size."),
    # ---------- Grains ----------
    dict(id="saffola_oats_plain", name="Oats (plain, instant rolled)", brand="Saffola",
         category="grain", serving=40, unit="g", form="dry",
         per_100=dict(kcal=369, protein_g=12.6, carbs_g=66.8, fat_g=8.0, fibre_g=10.4),
         pack=1300, price=213, mrp=235, price_src="Flipkart 1 kg + 300 g free",
         confidence="high", source="Saffola label (BigBasket/Zepto/Open Food Facts)",
         notes="One listing shows 5.3 g fat; most show 8 g."),
    dict(id="alpino_hp_super_oats_choc", name="High Protein Super Oats – Chocolate", brand="Alpino",
         category="grain", serving=40, unit="g", form="dry",
         per_100=dict(kcal=457.77, protein_g=22.0, carbs_g=51.34, fat_g=18.6, fibre_g=11.06),
         pack=1000, price=472.29, mrp=519, price_src="BigBasket 1 kg (400 g pack is ₹236.55, MRP ₹249)",
         confidence="high", source="Alpino label as listed on BigBasket: per 100 g 457.77 kcal, 22 g P, 18.6 g fat, 51.34 g carbs, 11.06 g fibre; label serving 40 g",
         notes="Made with oats, peanut butter, peanut protein and cocoa, so it carries much more fat than plain oats. No added sugar."),
    dict(id="rice_cooked", name="Cooked white rice", brand="Generic",
         category="grain", serving=100, unit="g", form="cooked",
         per_100=dict(kcal=130, protein_g=2.7, carbs_g=28.2, fat_g=0.3, fibre_g=0.4),
         pack=1000, price=80 / 2.85, mrp=None, price_src="Assumes raw rice at ₹80/kg and ~2.85x cooked yield (100 g cooked ≈ 35 g raw)",
         confidence="medium", source="USDA FoodData Central, white long-grain rice, cooked",
         notes="Varies by variety and how wet it's cooked. Pack/price fields here are per 1 kg cooked equivalent."),
    # ---------- Seeds (5 g each) ----------
    dict(id="chia_seeds", name="Chia seeds", brand="Generic",
         category="seed", serving=5, unit="g", form="raw",
         per_100=dict(kcal=486, protein_g=16.5, carbs_g=42.1, fat_g=30.7, fibre_g=34.4),
         pack=250, price=197.43, mrp=350, price_src="True Elements 250 g, BigBasket",
         confidence="high", source="USDA FoodData Central", notes=""),
    dict(id="flax_seeds_blended", name="Flax seeds (blended)", brand="Generic",
         category="seed", serving=5, unit="g", form="raw",
         per_100=dict(kcal=534, protein_g=18.3, carbs_g=28.9, fat_g=42.2, fibre_g=27.3),
         pack=250, price=102.81, mrp=149, price_src="True Elements 250 g, BigBasket",
         confidence="high", source="USDA FoodData Central",
         notes="Grinding doesn't change macros; it makes them absorbable."),
    dict(id="pumpkin_seeds", name="Pumpkin seeds", brand="Generic",
         category="seed", serving=5, unit="g", form="raw",
         per_100=dict(kcal=559, protein_g=30.2, carbs_g=10.7, fat_g=49.0, fibre_g=6.0),
         pack=250, price=289.25, mrp=325, price_src="True Elements 250 g, BigBasket",
         confidence="high", source="USDA FoodData Central (hulled, dried)", notes=""),
    dict(id="sunflower_seeds", name="Sunflower seeds", brand="Generic",
         category="seed", serving=5, unit="g", form="raw",
         per_100=dict(kcal=584, protein_g=20.8, carbs_g=20.0, fat_g=51.5, fibre_g=8.6),
         pack=250, price=134.46, mrp=162, price_src="True Elements 250 g, BigBasket",
         confidence="high", source="USDA FoodData Central (kernels, dried)", notes=""),
    # ---------- Pulses (50 g dry) ----------
    dict(id="moong_dal_yellow_split", name="Unpolished Moong Dal (yellow, split)", brand="Tata Sampann",
         category="pulse", serving=50, unit="g", form="dry",
         per_100=dict(kcal=347, protein_g=24.0, carbs_g=63.0, fat_g=1.0, fibre_g=9.4),
         pack=1000, price=150, mrp=213, price_src="BigBasket 1 kg",
         confidence="medium", source="Tata Sampann label via Swiggy Instamart (347 kcal, 24 g P, 63 g carbs, 1 g fat); fibre not listed, IFCT value used",
         notes="Snap your pack label to confirm fibre."),
    dict(id="green_moong_whole", name="Unpolished Green Moong (whole)", brand="Tata Sampann",
         category="pulse", serving=50, unit="g", form="dry",
         per_100=dict(kcal=347, protein_g=24.5, carbs_g=59.5, fat_g=1.2, fibre_g=15.5),
         pack=500, price=85, mrp=99, price_src="BigBasket 500 g",
         confidence="medium", source="Tata Sampann label as listed by a calorie-tracker app (347 kcal, 24.5 g P, 59.5 g carbs, 15.5 g fibre)",
         notes=""),
    dict(id="chole_kabuli", name="Unpolished Kabuli Chana (chole)", brand="Tata Sampann",
         category="pulse", serving=50, unit="g", form="dry",
         per_100=dict(kcal=378, protein_g=20.5, carbs_g=63.0, fat_g=6.0, fibre_g=12.2),
         pack=1000, price=185, mrp=210, price_src="Blinkit 1 kg",
         confidence="medium", source="Tata Sampann label not found online; USDA chickpea values used",
         notes="Send a photo of the pack label to replace these."),
    dict(id="rajma", name="Unpolished Rajma", brand="Tata Sampann",
         category="pulse", serving=50, unit="g", form="dry",
         per_100=dict(kcal=337, protein_g=22.5, carbs_g=61.3, fat_g=1.1, fibre_g=15.2),
         pack=500, price=98, mrp=122, price_src="BigBasket 500 g",
         confidence="medium", source="Tata Sampann label not found online; USDA red kidney bean values used",
         notes="Send a photo of the pack label to replace these."),
    dict(id="kala_chana", name="Unpolished Kala Chana", brand="Tata Sampann",
         category="pulse", serving=50, unit="g", form="dry",
         per_100=dict(kcal=340, protein_g=19.5, carbs_g=62.0, fat_g=5.5, fibre_g=18.0),
         pack=1000, price=110, mrp=120, price_src="BigBasket 1 kg",
         confidence="medium", source="Tata Sampann label not found online (the Instamart listing shows cooked-chana numbers); IFCT-based approximation",
         notes="Send a photo of the pack label to replace these."),
    dict(id="roasted_besan", name="Besan, roasted at home", brand="Tata Sampann",
         category="pulse", serving=50, unit="g", form="dry",
         per_100=dict(kcal=384, protein_g=21.5, carbs_g=62.3, fat_g=5.4, fibre_g=9.3),
         pack=1000, price=124, mrp=149, price_src="BigBasket/Flipkart 1 kg",
         confidence="high", source="Tata Sampann Fine Besan label (384 kcal, 21.5 g P, 5.4 g fat, 62.3 g carbs, 9.3 g fibre)",
         notes="Dry roasting only drives off a little moisture, so the raw label applies."),
    # ---------- Daily buffer: veg, oil, fruit ----------
    dict(id="cooking_fat_tsp", name="Cooking oil or ghee, 1 tsp", brand="Generic",
         category="buffer", serving=5, unit="g", form="raw",
         per_100=dict(kcal=900, protein_g=0.0, carbs_g=0.0, fat_g=100.0, fibre_g=0.0),
         pack=1000, price=180, mrp=None, price_src="Assumes ~₹180/kg refined oil; ghee is ~₹680/kg",
         confidence="high", source="Any oil or ghee is ~100% fat",
         notes="Your share of the oil in sabzi and dal. See the buffer note for how to estimate it."),
    dict(id="sabzi_veg_katori", name="Mixed veg sabzi or gravy, 1 katori (no oil)", brand="Generic",
         category="buffer", serving=150, unit="g", form="cooked",
         per_100=dict(kcal=35, protein_g=1.7, carbs_g=7.0, fat_g=0.2, fibre_g=2.5),
         pack=1000, price=100, mrp=None, price_src="Rough: ~₹100 of mixed veg per cooked kg",
         confidence="medium", source="Average of common Indian veg (onion, tomato, gourds, beans, cabbage, capsicum, palak) per USDA/IFCT; oil counted separately",
         notes="Potato, peas, corn or paneer-heavy sabzis are 2–3x higher; log those as their own items."),
    dict(id="fruit_medium", name="Fruit, 1 medium piece or bowl", brand="Generic",
         category="buffer", serving=1, unit="piece", form="raw",
         per_100=dict(kcal=80, protein_g=1.0, carbs_g=20.0, fat_g=0.3, fibre_g=3.0),
         pack=1, price=15, mrp=None, price_src="Rough average per piece",
         confidence="medium", source="Average of banana (~105 kcal), apple (~95), guava (~70), orange (~60), papaya bowl (~60)",
         notes="Per 100 here means per piece. Banana and mango run high; citrus and papaya low."),
]

# ---------- Roti: blended atta ----------
atta = dict(kcal=369, protein_g=10.8, carbs_g=77.4, fat_g=1.8, fibre_g=11.1)   # Aashirvaad Shudh Chakki, BigBasket label
besan = dict(kcal=384, protein_g=21.5, carbs_g=62.3, fat_g=5.4, fibre_g=9.3)   # Tata Sampann besan label
soy = dict(kcal=486, protein_g=36.2, carbs_g=36.0, fat_g=23.0, fibre_g=10.1)   # full-fat soya flour from FirstClub (your label)
ghee = dict(kcal=897, protein_g=0.0, carbs_g=0.0, fat_g=99.7, fibre_g=0.0)
mix = {k: round(0.5 * atta[k] + 0.25 * besan[k] + 0.25 * soy[k], 2) for k in atta}
blend_price_per_kg = 0.5 * 52 + 0.25 * 124 + 0.25 * 200   # atta ₹52/kg, TS besan ₹124/kg, soya flour ~₹200/kg (price not known)
FLOUR_G, GHEE_G = 26, 2
GHEE_PRICE_PER_G = 680 / 1000

roti_per = {k: FLOUR_G * mix[k] / 100 + GHEE_G * ghee[k] / 100 for k in mix}
roti_cost = FLOUR_G * blend_price_per_kg / 1000 + GHEE_G * GHEE_PRICE_PER_G

def rnd(d):
    return {k: round(v, 1) for k, v in d.items()}

out_items = []
for it in items:
    f = 1 if it["unit"] == "piece" else it["serving"] / 100
    per_serving = rnd({k: v * f for k, v in it["per_100"].items()})
    cost = round(it["price"] / it["pack"] * it["serving"], 2)
    p = it["per_100"]
    implied = 4 * p["protein_g"] + 4 * (p["carbs_g"] - p["fibre_g"]) + 2 * p["fibre_g"] + 9 * p["fat_g"]
    out_items.append({
        "id": it["id"],
        "name": it["name"],
        "brand": it["brand"],
        "product": (it["brand"] + " " + it["name"]) if it["brand"] not in ("Generic",) else it["name"],
        "category": it["category"],
        "serving": {"amount": it["serving"], "unit": it["unit"], "form": it["form"],
                    "label": it.get("serving_label", f'{it["serving"]} {it["unit"]}' + (" dry" if it["form"] == "dry" else " cooked" if it["form"] == "cooked" else ""))},
        "per_100": p,
        "per_serving": per_serving,
        "cost": {
            "cost_per_serving_inr": cost,
            "cost_per_10g_protein_inr": round(cost / per_serving["protein_g"] * 10, 2) if per_serving["protein_g"] >= 1 else None,
            "pack_size": it["pack"], "pack_unit": it["unit"],
            "pack_price_inr": round(it["price"], 2), "mrp_inr": it["mrp"],
            "price_source": it["price_src"], "price_as_of": AS_OF,
        },
        "source": it["source"],
        "confidence": it["confidence"],
        "kcal_check": {"implied_kcal_per_100": round(implied), "label_kcal_per_100": p["kcal"],
                       "flag": abs(implied - p["kcal"]) / p["kcal"] > 0.15},
        "notes": it["notes"],
    })

roti = {
    "id": "roti_blended_atta_ghee",
    "name": "Roti (50% Aashirvaad atta + 25% Tata Sampann besan + 25% FirstClub soya flour) with ghee",
    "brand": "Home-made",
    "product": "Home-made roti, blended flour",
    "category": "grain",
    "serving": {"amount": 1, "unit": "piece", "form": "cooked", "label": "1 roti (35 g cooked) + 2 g ghee"},
    "per_serving": rnd(roti_per),
    "per_serving_without_ghee": rnd({k: FLOUR_G * mix[k] / 100 for k in mix}),
    "per_100_dry_blend": mix,
    "cost": {"cost_per_serving_inr": round(roti_cost, 2),
             "cost_per_10g_protein_inr": round(roti_cost / roti_per["protein_g"] * 10, 2),
             "blend_price_per_kg_inr": blend_price_per_kg,
             "ghee_price_per_kg_inr": 680,
             "price_source": "Aashirvaad atta ~₹52/kg (10 kg pack), Tata Sampann besan ~₹124/kg, FirstClub soya flour assumed ~₹200/kg (send actual), Amul ghee ₹680/kg (Nov 2026)",
             "price_as_of": AS_OF},
    "derivation": {
        "cooked_weight_g": 35,
        "estimated_dry_flour_g": FLOUR_G,
        "dry_flour_range_g": [24, 28],
        "ghee_g": GHEE_G,
        "ghee_range_g": [1.5, 2.5],
        "method": "35 g is cooked weight, not raw. A cooked roti is ~30–35% water; atta is ~11% water. So dry flour ≈ 35 × (0.65–0.70) ÷ 0.89 ≈ 25.5–27.5 g → 26 g. Ghee: half a teaspoon ≈ 2.3 g, 'less than half' → 2 g.",
        "assumptions": ["35 g weighed before ghee", "a fresh roti is ~30–35% water (see check_it_yourself)", "dusting flour ignored (adds ~1 g)"],
        "check_it_yourself": "Weigh the dry flour for one batch (say 200 g), count the rotis and weigh them all just off the tawa, before ghee. Flour per roti = 200 ÷ count; water share = 1 − (200 × 0.89) ÷ total roti weight. Update estimated_dry_flour_g with your number.",
        "range_kcal": [round(24 * mix["kcal"] / 100 + 1.5 * 8.97), round(28 * mix["kcal"] / 100 + 2.5 * 8.97)],
    },
    "source": "Atta: Aashirvaad Shudh Chakki label (BigBasket). Besan: Tata Sampann label. Soya flour: FirstClub pack label (486 kcal, 36.2 g P, 23 g fat, 36 g carbs, 10.1 g fibre). Ghee: 99.7% fat.",
    "confidence": "medium",
    "notes": "Your soya flour is full-fat, so it adds fat as well as protein: about 1.5 g of each roti's fat comes from it.",
}

# ---------- Meals built from library items ----------
COMPOSITES = [
    dict(id="whey_oats_shake", name="Whey protein shake (whey + oats + milk + chia + flax)", category="meal",
         label="1 shake", parts=[("myprotein_impact_whey_choc_smooth", 1), ("saffola_oats_plain", 1), ("amul_taaza_milk", 1), ("chia_seeds", 1), ("flax_seeds_blended", 1)]),
    dict(id="alpino_oats_milk_bowl", name="Alpino protein oats with milk", category="meal",
         label="1 bowl (40 g oats + 200 ml milk)", parts=[("alpino_hp_super_oats_choc", 1), ("amul_taaza_milk", 1)]),
]
by_id = {i["id"]: i for i in out_items}
for c in COMPOSITES:
    ps = {k: 0.0 for k in ["kcal", "protein_g", "carbs_g", "fat_g", "fibre_g"]}
    cost = 0.0
    comps = []
    for pid, q in c["parts"]:
        p = by_id[pid]
        for k in ps:
            ps[k] += q * p["per_serving"][k]
        cost += q * p["cost"]["cost_per_serving_inr"]
        comps.append({"id": pid, "servings": q, "serving": p["serving"]["label"], "product": p["product"]})
    ps = rnd(ps)
    out_items.append({
        "id": c["id"], "name": c["name"], "brand": "Home-made", "product": c["name"], "category": c["category"],
        "serving": {"amount": 1, "unit": "piece", "form": "prepared", "label": c["label"]},
        "per_serving": ps,
        "cost": {"cost_per_serving_inr": round(cost, 2), "cost_per_10g_protein_inr": round(cost / ps["protein_g"] * 10, 2),
                 "price_source": "Sum of the component items' costs", "price_as_of": AS_OF},
        "components": comps,
        "source": "Sum of component items in this library; updates when any component changes",
        "confidence": "high",
        "notes": "Don't also log the components separately when you log this.",
    })

DICT_ID = {
    "milky_mist_hp_low_fat_paneer": "paneer_low_fat", "amul_malai_paneer": "paneer", "amul_taaza_milk": "milk",
    "amul_masti_dahi": "curd", "soya_chunks_fortune": "soya_chunks", "hello_tempayy_crumbles": "tempeh",
    "mooz_tofu": "tofu_firm", "hello_tempayy_momos_peri_peri": "momos", "amul_diced_cheese_blend": "cheese",
    "myprotein_impact_whey_choc_smooth": "whey_protein", "saffola_oats_plain": "oats", "alpino_hp_super_oats_choc": "protein_oats",
    "rice_cooked": "rice_cooked", "chia_seeds": "chia_seeds", "flax_seeds_blended": "flax_seeds", "pumpkin_seeds": "pumpkin_seeds",
    "sunflower_seeds": "sunflower_seeds", "moong_dal_yellow_split": "moong_dal_yellow", "green_moong_whole": "moong_green",
    "chole_kabuli": "chickpeas", "rajma": "rajma", "kala_chana": "kala_chana", "roasted_besan": "besan",
    "cooking_fat_tsp": "oil", "sabzi_veg_katori": "mixed_vegetables", "roti_blended_atta_ghee": "roti",
}
for it in out_items + [roti]:
    it["ingredient_id"] = DICT_ID.get(it["id"])

library = {
    "schema_version": "1.1",
    "title": "Jatin's macros library",
    "as_of": AS_OF,
    "conventions": {
        "units": "kcal and grams; milk in ml",
        "carbs_g": "total carbohydrate INCLUDING fibre (net carbs = carbs_g - fibre_g)",
        "per_100": "per 100 g or 100 ml in the stated form (dry / raw / cooked); for unit=piece it is per piece",
        "form": "dry = uncooked weight (pulses, soya chunks, oats, flours); raw = as sold; cooked = after cooking",
        "cost": "INR, based on online selling prices seen on as_of date; scale linearly from pack price",
        "confidence": "high = official/brand label or your pack photo; medium = crowd-sourced, reference values or estimated",
        "ingredient_id": "matching id in the protein-plate repo's data/ingredients.json dictionary; null when there is no single match (meals, fruit)",
        "brand": "brand = who made it; product = brand + product name; Generic = no brand",
        "meal": "category meal = a fixed recipe built from other library items; components lists them; macros are their sum",
        "buffer": "category buffer = rough everyday extras (oil, veg sabzi, fruit, sauces) logged as standard portions rather than weighed",
    },
    "items": out_items + [roti],
}

with open("data/macros-library.json", "w") as fh:
    json.dump(library, fh, indent=2, ensure_ascii=False)

for it in library["items"]:
    s = it["per_serving"]
    print(f'{it["id"]:<36} {it["serving"]["label"]:<26} {s["kcal"]:>6} kcal  P{s["protein_g"]:>5}  C{s["carbs_g"]:>5}  F{s["fat_g"]:>5}  Fi{s["fibre_g"]:>5}  ₹{it["cost"]["cost_per_serving_inr"]:>6}  {"FLAG" if it.get("kcal_check",{}).get("flag") else ""}')
print(json.dumps(roti["derivation"], indent=1))
