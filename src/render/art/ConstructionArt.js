export function constructionSiteArt(batch,building){
  const {x,z,r}=building,p=building.progress,stone=[.34,.34,.29],wood=[.35,.27,.17],metal=[.27,.31,.30],supply=[.50,.42,.27];
  batch.add('ring',x,.14,z,r*2.7,.08,r*2.7,[.72,.56,.25]);
  batch.add('box',x,.16,z,r*2.1,.22,r*2.1,stone);
  for(const dx of[-r*.82,r*.82])for(const dz of[-r*.82,r*.82])batch.add('box',x+dx,.65,z+dz,.16,1.2,.16,wood);
  if(p>=.25){for(const side of[-1,1]){batch.add('box',x+side*r*.72,1.45,z,.18,2.7,r*1.7,metal);batch.add('box',x,1.2,z+side*r*.72,r*1.7,2.1,.18,metal);}for(let i=0;i<3;i++)batch.add('box',x-r*.55+i*r*.55,.42,z+r*.88,.75,.55,.65,supply,.08*i);}
  if(p>=.55){const height=1.2+(p-.55)*4.6;batch.add('box',x,.25+height/2,z,r*1.55,height,r*1.4,[.38,.39,.34]);batch.add('box',x,.25+height,z,r*1.8,.18,r*1.65,metal);}
  if(p>=.82){batch.add('box',x-r*.45,3.5,z,.25,2.7,.25,metal);batch.add('box',x-r*.45,4.7,z,1.2,.18,.18,[.60,.52,.31]);}
}
export function placementFeedbackArt(batch,building){const color=building.valid?[.63,.78,.49]:[.82,.28,.18],x=building.x,z=building.z,r=building.r;batch.add('ring',x,.28,z,r*2.9,.12,r*2.9,color);if(building.valid){batch.add('box',x-.35,2.9,z,.18,1.3,.18,color,0,.9,0,.65);batch.add('box',x+.28,3.15,z,.18,2,.18,color,0,.9,0,-.65);}else{for(const rot of[.78,-.78])batch.add('box',x,3,z,.18,2.4,.18,color,0,.9,0,rot);}}
