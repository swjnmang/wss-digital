import re

files = [
    r'c:\Users\mailt\OneDrive\KI Programme\wss-digital\module\src\pages\gamification\GamificationNutzen.tsx',
    r'c:\Users\mailt\OneDrive\KI Programme\wss-digital\module\src\pages\gamification\DigitaleSpiele.tsx',
    r'c:\Users\mailt\OneDrive\KI Programme\wss-digital\module\src\pages\gamification\Gesellschaftsspiele.tsx',
]

# Matches: <span className={`...${CONDITION ? 'rotate-45' : ''}`}>➕</span>
pattern = re.compile(
    r'<span[^>]*\$\{([^?`]+?)\s*\?\s*\'rotate-45\'\s*:\s*\'\'\}[^`]*`\}>\u2795</span>'
)

def make_svg(condition):
    cond = condition.strip()
    return (
        '<svg className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-4 transform transition-transform '
        '${' + cond + " ? 'rotate-180' : ''}"
        '`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>'
        '<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>'
    )

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    matches = pattern.findall(content)
    new_content = pattern.sub(lambda m: make_svg(m.group(1)), content)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'{len(matches)} replacements in {path.split(chr(92))[-1]}')

print('Done.')
