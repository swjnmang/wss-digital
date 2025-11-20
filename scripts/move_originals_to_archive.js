const fs = require('fs')
const path = require('path')

const repoRoot = path.resolve(__dirname, '..')
const archiveRoot = path.join(repoRoot, 'archive_original_site')

const IGNORE_TOP = new Set(['.git', 'node_modules', 'frontend', 'scripts', '.vscode', 'archive_original_site'])
const EXT_ALLOW = new Set(['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico', '.json'])

function ensureDir(dir){ if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }) }

function shouldMoveFile(filePath){
  const ext = path.extname(filePath).toLowerCase()
  return EXT_ALLOW.has(ext) || ext === '' // also move files without ext (like copy_static.js)
}

ensureDir(archiveRoot)

const entries = fs.readdirSync(repoRoot, { withFileTypes: true })
for(const e of entries){
  if(IGNORE_TOP.has(e.name)) continue
  const full = path.join(repoRoot, e.name)
  const dest = path.join(archiveRoot, e.name)
  try{
    if(e.isDirectory()){
      // check if directory contains any allowed files; if yes, move whole dir
      const files = fs.readdirSync(full)
      const hasAllowed = files.some(f => EXT_ALLOW.has(path.extname(f).toLowerCase()) || fs.statSync(path.join(full,f)).isDirectory())
      if(hasAllowed){
        fs.renameSync(full, dest)
        console.log('moved dir', e.name)
      } else {
        // skip directories that are purely code (e.g., unknown)
      }
    } else if(e.isFile()){
      if(shouldMoveFile(full)){
        ensureDir(path.dirname(dest))
        fs.renameSync(full, dest)
        console.log('moved file', e.name)
      }
    }
  } catch(err){
    console.error('error moving', full, err.message)
  }
}

console.log('done')
