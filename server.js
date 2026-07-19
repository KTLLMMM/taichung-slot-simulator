// 模擬器預覽用極簡靜態伺服器（僅本機）
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const PORT = 8877;
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.gif':'image/gif', '.webm':'video/webm' };
http.createServer((req,res)=>{
  if(req.method==='POST' && req.url.split('?')[0]==='/save'){
    const q = new URL(req.url,'http://x').searchParams;
    const name = (q.get('name')||'shot.png').replace(/[^\w.-]/g,'_');
    let body=''; req.on('data',c=>body+=c);
    req.on('end',()=>{
      const m = body.match(/^data:image\/png;base64,(.*)$/s);
      if(!m){ res.writeHead(400); return res.end('bad'); }
      const dir = path.join(ROOT,'_shots');
      fs.mkdirSync(dir,{recursive:true});
      fs.writeFileSync(path.join(dir,name), Buffer.from(m[1],'base64'));
      res.writeHead(200); res.end('ok');
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if(p.endsWith('/')) p += 'index.html';
  const fp = path.join(ROOT, p);
  if(!fp.startsWith(ROOT)){ res.writeHead(403); return res.end(); }
  fs.readFile(fp,(err,data)=>{
    if(err){ res.writeHead(404); return res.end('not found'); }
    res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});
    res.end(data);
  });
}).listen(PORT,()=>console.log('simulator on http://localhost:'+PORT));
