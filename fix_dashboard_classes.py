import re

with open("frontend/src/pages/dashboard/Dashboard.tsx", "r") as f:
    content = f.read()

# Fix double className: `<Card className="glass-panel animate-card hover-lift" bordered={false} className="hover-lift gradient-card-1"`
# I'll just remove `className="glass-panel animate-card hover-lift" ` from those cards, and append the animation classes to the existing className.

# First, revert the previous bad replace.
# Actually, it's easier to find all `<Card...>` and merge classNames.

def merge_classnames(match):
    full_match = match.group(0)
    # Find all classNames
    classes = re.findall(r'className="([^"]+)"', full_match)
    if not classes:
        return full_match
    
    # Combine and deduplicate
    combined = " ".join(classes)
    unique_classes = []
    for cls in combined.split():
        if cls not in unique_classes:
            unique_classes.append(cls)
            
    # Ensure our animation classes are in there if it's a dashboard card (except if it doesn't need it)
    if 'hover-lift' in unique_classes or 'gradient-card' in unique_classes or 'glass-panel' in unique_classes:
        if 'animate-card' not in unique_classes:
            unique_classes.append('animate-card')
        if 'glass-panel' not in unique_classes:
            unique_classes.append('glass-panel')
            
    final_class_str = 'className="' + ' '.join(unique_classes) + '"'
    
    # Remove all existing classNames
    cleaned_tag = re.sub(r'\s*className="[^"]+"', '', full_match)
    
    # Insert the new className after <Card
    final_tag = cleaned_tag.replace("<Card", f"<Card {final_class_str}", 1)
    return final_tag

content = re.sub(r'<Card[^>]*>', merge_classnames, content)

with open("frontend/src/pages/dashboard/Dashboard.tsx", "w") as f:
    f.write(content)
