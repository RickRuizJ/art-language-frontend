const fs=require('fs'),path=require('path');
const root=path.dirname(require.resolve('pdfjs-dist/package.json'));
const dest=path.join(__dirname,'..','public','pdfjs');fs.mkdirSync(dest,{recursive:true});
fs.copyFileSync(path.join(root,'build','pdf.worker.min.mjs'),path.join(dest,'pdf.worker.min.mjs'));
for(const name of ['cmaps','standard_fonts','wasm'])fs.cpSync(path.join(root,name),path.join(dest,name),{recursive:true});
