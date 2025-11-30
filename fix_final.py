import re

with open('ts-src/scripts/adventure-kit.ts', 'r') as f:
    content = f.read()

content = content.replace("_focusMap", "focusMapACK")
content = content.replace("globalThis.setCoordTargetACK", "globalThis.setCoordTarget")

def broad_wrap(match):
    lhs = match.group(1)
    rhs = match.group(2)
    if rhs.startswith("String(") or rhs.startswith("'") or rhs.startswith('"') or rhs.startswith("`"):
        return f"{lhs} = {rhs};"
    return f"{lhs} = String({rhs});"

content = re.sub(r"(\([^)]+\)\.value)\s*=\s*([^;]+);", broad_wrap, content)

content = content.replace("placingCb()", "(placingCb as any)()")

with open('ts-src/scripts/adventure-kit.ts', 'w') as f:
    f.write(content)
