import re
import os

BASE = "F:/Vinatier/informatique/Appli_Felicien"

files_and_badges = [
    (f"{BASE}/TND/Page_d_accueil.html",                        "badge-cat-tnd"),
    (f"{BASE}/Trouble_de_l_humeur/Page_d_accueil.html",        "badge-cat-humeur"),
    (f"{BASE}/Trouble_anxieux/Page_d_accueil.html",            "badge-cat-anxiete"),
    (f"{BASE}/Trouble_de_la_personnalite/Page_d_accueil.html", "badge-cat-perso"),
    (f"{BASE}/Trouble_d_usage_substance/Page_d_accueil.html",  "badge-cat-substance"),
    (f"{BASE}/Trauma/Page_d_accueil.html",                     "badge-cat-trauma"),
    (f"{BASE}/Crise_suicidaire/Page_d_accueil.html",           "badge-cat-crise"),
    (f"{BASE}/Enfant_ado/Page_d_accueil.html",                 "badge-cat-enfant"),
    (f"{BASE}/Rehab/Page_d_accueil.html",                      "badge-cat-rehab"),
    (f"{BASE}/Psychose/Page_d_accueil.html",                   "badge-cat-psychose"),
    (f"{BASE}/Guides/Page_d_accueil.html",                     "badge-cat-guides"),
    (f"{BASE}/Cas_Cliniques/Page_d_accueil.html",              "badge-cat-clinique"),
    (f"{BASE}/Ressources_Formation/Page_d_accueil.html",       "badge-cat-recherche"),
    (f"{BASE}/Transculturelle/Page_d_accueil.html",            "badge-cat-guides"),
]

# Matches any <span class="badge ..."> opening tag, with optional inline style
BADGE_PATTERN = re.compile(
    r'<span\s+class="badge(?:\s+[\w-]+)*"\s*(?:style="[^"]*"\s*)?>',
    re.IGNORECASE
)

def process_file(filepath, new_badge_class):
    if not os.path.isfile(filepath):
        print(f"  SKIP  {os.path.basename(os.path.dirname(filepath))}/Page_d_accueil.html  (file not found)")
        return

    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    changed = False
    new_lines = list(lines)

    for i, line in enumerate(lines[:200]):
        if "badge" not in line.lower():
            continue

        def replacer(m):
            return f'<span class="badge {new_badge_class}">'

        new_line, n = BADGE_PATTERN.subn(replacer, line)
        if n > 0:
            new_lines[i] = new_line
            changed = True
            folder = os.path.basename(os.path.dirname(filepath))
            print(f"  OK    {folder}/Page_d_accueil.html  ->  class=\"badge {new_badge_class}\"")
            print(f"        Line {i+1} BEFORE: {line.strip()[:110]}")
            print(f"        Line {i+1} AFTER : {new_line.strip()[:110]}")
            break

    if not changed:
        folder = os.path.basename(os.path.dirname(filepath))
        print(f"  WARN  {folder}/Page_d_accueil.html  (no badge span found in first 200 lines)")
        # Show what IS in the first 200 lines with 'badge' to help debug
        hits = [(j+1, l.strip()) for j, l in enumerate(lines[:200]) if "badge" in l.lower()]
        for lineno, txt in hits:
            print(f"        [badge context line {lineno}]: {txt[:110]}")
        return

    with open(filepath, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

print("=" * 72)
print("Badge update — navigation bar  (badge-cat-* CSS classes)")
print("=" * 72)
for fp, cls in files_and_badges:
    process_file(fp, cls)
print("=" * 72)
print("Done.")
