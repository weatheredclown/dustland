import re

filepath = 'ts-src/scripts/dustland-core.ts'

with open(filepath, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Remove TODO line
    if 'migrate dustland-core to the typed DustlandCoreGlobals surface' in line:
        continue

    # Skip the definition line
    if 'const coreGlobals = globalThis as unknown as DustlandCoreGlobals;' in line:
        new_lines.append(line)
        continue

    # Handle globalThis[gen]
    if 'globalThis[' in line:
        line = line.replace('globalThis[', '(coreGlobals as any)[')

    # Replace globalThis with coreGlobals
    # Use regex to ensure we only replace whole word globalThis
    line = re.sub(r'\bglobalThis\b', 'coreGlobals', line)

    new_lines.append(line)

with open(filepath, 'w') as f:
    f.writelines(new_lines)

print("Migration complete.")
