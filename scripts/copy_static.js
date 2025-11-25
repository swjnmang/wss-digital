const fs = require('fs')
const path = require('path')

const repoRoot = path.resolve(__dirname, '..')
const appPublic = path.join(repoRoot, 'mathe-trainer', 'public')

const IGNORES = ['node_modules', '.git', 'mathe-trainer', '.vscode', 'dist']
const EXT_ALLOW = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico', '.json']

function ensureDirSync(dir){
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function shouldIgnore(rel){
  return IGNORES.some(i => rel.split(path.sep)[0] === i)
}

function walkAndCopy(dir){
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for(const e of entries){
    const full = path.join(dir, e.name)
    const rel = path.relative(repoRoot, full)
    if(shouldIgnore(rel)) continue
    if(e.isDirectory()){
      walkAndCopy(full)
    } else if(e.isFile()){
      const ext = path.extname(e.name).toLowerCase()
      if(EXT_ALLOW.includes(ext)){
        const dest = path.join(appPublic, rel)
        ensureDirSync(path.dirname(dest))
        fs.copyFileSync(full, dest)
        console.log('copied', rel)
      }
    }
  }
}

ensureDirSync(appPublic)
walkAndCopy(repoRoot)
console.log('done')
