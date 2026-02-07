#!/usr/bin/env python3
import re

with open(r"c:\Users\mailt\OneDrive\KI Programme\wss-digital\mathe-trainer\src\pages\rechnen_lernen\gleichungen\Generator_lineare.tsx", 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern: rechenweg: ['equation', 'different_equation  | op', ...]
# Where the first equation becomes a "raw" step and the second has a transformation
# We want to merge them: ['equation  | op', 'different_equation', ...]

# Pattern 1: Simple case where transformation operator changes the equation
# ['equation1', 'equation2  | operation', ...] -> if equation2 is result of equation1 transformation
# ['equation1  | operation', 'equation2', ...]

pattern = r"rechenweg:\s*\['([^']+)',\s*'([^']+)\s+\|\s+([^']+)'"

def fix_rechenweg(match):
    eq1 = match.group(1)
    eq2 = match.group(2)
    op = match.group(3)
    
    # If eq2 is the transformed result of eq1, then keep first structure
    # If eq2 is just showing the work, merge them
    # Most common case: ['2x + 3 = x + 8', '2x - x = 8 - 3  | -x -3'...]
    # Should become: ['2x + 3 = x + 8  | -x -3', '2x - x = 8 - 3', ...]
    
    # Return with the operation on the first line
    return f"rechenweg: ['{eq1}  | {op}', '{eq2}'"

content = re.sub(pattern, fix_rechenweg, content)

with open(r"c:\Users\mailt\OneDrive\KI Programme\wss-digital\mathe-trainer\src\pages\rechnen_lernen\gleichungen\Generator_lineare.tsx", 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed all rechenweg patterns")
