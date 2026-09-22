from pathlib import Path, PurePosixPath
import re
import posixpath
root=Path(__file__).parent
entry='src/main.js'
modules={}

def resolve(owner,spec):
    if not spec.startswith('.'):
        raise ValueError(f'Only relative imports are supported: {spec}')
    return posixpath.normpath(str(PurePosixPath(owner).parent/PurePosixPath(spec)))

def dependencies(text,owner):
    patterns=[r'import\s+[\s\S]*?\s+from\s+["\']([^"\']+)["\']\s*;',r'export\s+(?:\*|\{[\s\S]*?\})\s+from\s+["\']([^"\']+)["\']\s*;']
    found=[]
    for pattern in patterns:
        for spec in re.findall(pattern,text):
            found.append(resolve(owner,spec))
    return found

def visit(module_id):
    if module_id in modules:return
    path=root/module_id
    text=path.read_text()
    modules[module_id]=text
    for dependency in dependencies(text,module_id):visit(dependency)

visit(entry)

def binding_lines(clause,dependency,index):
    ref=f'__dep{index}'
    lines=[f'const {ref}=__require({dependency!r});']
    clause=clause.strip()
    if clause.startswith('{'):
        for item in clause[1:-1].split(','):
            item=item.strip()
            if not item:continue
            parts=re.split(r'\s+as\s+',item)
            source=parts[0].strip();local=parts[-1].strip()
            lines.append(f'const {local}={ref}.{source};')
    elif clause.startswith('* as '):
        lines.append(f'const {clause[5:].strip()}={ref};')
    else:
        lines.append(f'const {clause}={ref}.default;')
    return ''.join(lines)

def transform(module_id,text):
    pre=[];post=[];counter=0
    import_pattern=re.compile(r'import\s+([\s\S]*?)\s+from\s+["\']([^"\']+)["\']\s*;')
    def import_repl(match):
        nonlocal counter
        dependency=resolve(module_id,match.group(2));line=binding_lines(match.group(1),dependency,counter);counter+=1;pre.append(line);return ''
    text=import_pattern.sub(import_repl,text)
    export_from=re.compile(r'export\s+\{([\s\S]*?)\}\s+from\s+["\']([^"\']+)["\']\s*;')
    def export_from_repl(match):
        nonlocal counter
        dep=resolve(module_id,match.group(2));ref=f'__rex{counter}';counter+=1;lines=[f'const {ref}=__require({dep!r});']
        for item in match.group(1).split(','):
            item=item.strip()
            if not item:continue
            parts=re.split(r'\s+as\s+',item);source=parts[0].strip();target=parts[-1].strip();lines.append(f'__exports.{target}={ref}.{source};')
        post.append(''.join(lines));return ''
    text=export_from.sub(export_from_repl,text)
    export_all=re.compile(r'export\s+\*\s+from\s+["\']([^"\']+)["\']\s*;')
    def export_all_repl(match):post.append(f'Object.assign(__exports,__require({resolve(module_id,match.group(1))!r}));');return ''
    text=export_all.sub(export_all_repl,text)
    names=[]
    declaration=re.compile(r'export\s+(class|function|const|let|var)\s+([A-Za-z_$][\w$]*)')
    def declaration_repl(match):names.append(match.group(2));return f'{match.group(1)} {match.group(2)}'
    text=declaration.sub(declaration_repl,text)
    local_export=re.compile(r'export\s+\{([^}]+)\}\s*;')
    def local_export_repl(match):
        for item in match.group(1).split(','):
            parts=re.split(r'\s+as\s+',item.strip());source=parts[0].strip();target=parts[-1].strip();post.append(f'__exports.{target}={source};')
        return ''
    text=local_export.sub(local_export_repl,text)
    for name in names:post.append(f'__exports.{name}={name};')
    return ''.join(pre)+'\n'+text+'\n'+'\n'.join(post)

factories=[]
for module_id,text in modules.items():
    factories.append(f'{module_id!r}:function(__exports,__require){{\n{transform(module_id,text)}\n}}')
bundle="""const __factories={%s};
const __cache=Object.create(null);
function __require(id){if(__cache[id])return __cache[id];const exports=__cache[id]={};const factory=__factories[id];if(!factory)throw Error('Missing module '+id);factory(exports,__require);return exports;}
__require(%r);
"""%(',\n'.join(factories),entry)
html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(root/'style.css').read_text()+'</style>')
html=html.replace('<script type="module" src="src/main.js"></script>','<script>\n'+bundle+'\n</script>')
out=root/'Trench-Crusade-Faz05.html';out.write_text(html)
print('Standalone HTML created:',len(html.encode()),'bytes,',len(modules),'modules')
