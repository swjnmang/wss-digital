#!/usr/bin/env python3
# Advanced script to fix ALL rechenweg structures

import re

# Read the file
with open(r"c:\Users\mailt\OneDrive\KI Programme\wss-digital\mathe-trainer\src\pages\rechnen_lernen\gleichungen\Generator_lineare.tsx", 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Process each line
new_lines = []
for line in lines:
    # Pattern: ['equation', 'equation  | op', ...
    # Replace with: ['equation  | op', ...
    
    # More sophisticated pattern matching
    match = re.search(r"\['([^']+)',\s*'(\1)\s+\|\s+([^']+)'", line)
    if match:
        equation = match.group(1)
        operation = match.group(3)
        # Replace in the line
        old_pattern = f"['{equation}', '{equation}  | {operation}'"
        new_pattern = f"['{equation}  | {operation}'"
        line = line.replace(old_pattern, new_pattern)
    
    new_lines.append(line)

# Write back
with open(r"c:\Users\mailt\OneDrive\KI Programme\wss-digital\mathe-trainer\src\pages\rechnen_lernen\gleichungen\Generator_lineare.tsx", 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fixed rechenweg structures")
