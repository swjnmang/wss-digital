#!/usr/bin/env python3
# Script to fix the rechenweg structure in Generator_lineare.tsx

import re

# Read the file
with open(r"c:\Users\mailt\OneDrive\KI Programme\wss-digital\mathe-trainer\src\pages\rechnen_lernen\gleichungen\Generator_lineare.tsx", 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find rechenweg arrays with duplated first step
# Pattern: rechenweg: ['equation', 'equation  | operation', ...]
# Replace with: rechenweg: ['equation  | operation', ...]

def fix_rechenweg(match):
    full_match = match.group(0)
    
    # Extract the rechenweg part
    # Look for pattern: rechenweg: ['x + 7 = 12', 'x + 7 = 12  | - 7', 'x = 5']
    
    # Find the equation (first item in the array)
    first_bracket = full_match.find('[')
    second_quote = full_match.find("'", first_bracket)
    # Find the end of the first item
    first_item_end = full_match.find("'", second_quote + 1)
    first_item = full_match[second_quote+1:first_item_end]
    
    # Check if there's a second item that starts with the same equation
    # Find second quote after first item
    second_start = full_match.find("'", first_item_end + 1)
    if second_start != -1:
        second_item_end = full_match.find("'", second_start + 1)
        if second_item_end != -1:
            second_item = full_match[second_start+1:second_item_end]
            
            # Check if second item starts with the same equation and has a |
            if second_item.startswith(first_item) and '  |' in second_item:
                # Replace the pattern: ['equation', 'equation  | op', ...] 
                # with: ['equation  | op', ...]
                new_match = full_match.replace(
                    f"['{first_item}', '{second_item}'",
                    f"['{second_item}'"
                )
                return new_match
    
    return full_match

# This approach is complex, so let's use a simpler regex-based approach
# Match patterns like: ['x + 7 = 12', 'x + 7 = 12  | - 7'
pattern = r"\['([^']+)',\s*'\1\s+\|\s+([^']+)'"

def replace_func(match):
    equation = match.group(1)
    operation = match.group(2)
    return f"['{equation}  | {operation}'"

# Apply the replacement multiple times until no more changes
previous = ""
iteration = 0
while content != previous and iteration < 100:
    previous = content
    content = re.sub(pattern, replace_func, content)
    iteration += 1

# Write back
with open(r"c:\Users\mailt\OneDrive\KI Programme\wss-digital\mathe-trainer\src\pages\rechnen_lernen\gleichungen\Generator_lineare.tsx", 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed {iteration} iterations")
print("Done!")
