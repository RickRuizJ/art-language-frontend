'use client';
import {useEffect,useRef,useState} from 'react';
// Canvas and overlays share one responsive coordinate system; never modify PDF bytes.
export default function PdfSurface({url,page=1,onPages,onSize,children}){
 const canvas=useRef(null),container=useRef(null),[pdf,setPdf]=useState(null),[width,setWidth]=useState(800),[ratio,setRatio]=useState(1.414),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{let task,active=true;setError('');setLoading(true);setPdf(null);
  (async()=>{try{const lib=await import('pdfjs-dist');lib.GlobalWorkerOptions.workerSrc='/pdfjs/pdf.worker.min.mjs';if(!active)return;task=lib.getDocument({url,isEvalSupported:false,cMapUrl:'/pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'/pdfjs/standard_fonts/',wasmUrl:'/pdfjs/wasm/'});const doc=await task.promise;if(active){setPdf(doc);onPages?.(doc.numPages);}}catch(e){if(active){setError('Could not render this PDF. Check its sharing permissions or try another PDF.');setLoading(false);}}})();return()=>{active=false;task?.destroy();};
 },[url]);
 useEffect(()=>{const el=container.current;if(!el)return;const observer=new ResizeObserver(entries=>setWidth(Math.max(1,entries[0].contentRect.width)));observer.observe(el);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(!pdf)return;let render,active=true;setLoading(true);
  (async()=>{try{const p=await pdf.getPage(page);if(!active)return;const raw=p.getViewport({scale:1});setRatio(raw.height/raw.width);onSize?.({width:raw.width,height:raw.height});const viewport=p.getViewport({scale:width/raw.width}),dpr=Math.min(window.devicePixelRatio||1,2),c=canvas.current;c.width=Math.floor(viewport.width*dpr);c.height=Math.floor(viewport.height*dpr);render=p.render({canvasContext:c.getContext('2d'),viewport,transform:dpr===1?null:[dpr,0,0,dpr,0,0]});await render.promise;if(active)setLoading(false);}catch(e){if(active&&e.name!=='RenderingCancelledException'){setError('This page could not render.');setLoading(false);}}})();return()=>{active=false;render?.cancel();};
 },[pdf,page,width]);
 return <div ref={container} className="w-full"><div className="relative bg-white shadow border" data-testid="pdf-page" style={{aspectRatio:`1 / ${ratio}`}}><canvas ref={canvas} className="absolute inset-0 w-full h-full" aria-label={`PDF page ${page}`}/>{!loading&&!error&&children}{loading&&!error&&<div className="absolute inset-0 flex items-center justify-center bg-white/80">Loading PDF page…</div>}{error&&<div role="alert" className="absolute inset-0 flex items-center justify-center p-6 text-red-700 bg-white">{error}</div>}</div></div>;
}
