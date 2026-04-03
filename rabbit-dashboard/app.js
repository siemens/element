const variants = {
  small: ['(\\_/)\n(\'.')\n(\" ) (\")', '(\\_/)\n(•_•)\n(> <)'],
  classic: ['  (\\_/)\n  (=\'.'=)\n  (")_(")'],
  sitting: ['   (\\_/)\n  ((•_•))\n   (   )\n   ^^ ^^'],
  longEars: ['   /\\_/\\\n  ( o.o )\n   > ^ <'],
  hopping: [' (\\_/)\n (•_•)\n /) )', ' (\\_/)\n (•_•)\n  ( (\\', '  (\\_/)\n  (•_•)\n  /) )']
};

const variantSelect = document.getElementById('variant');
const rabbitEl = document.getElementById('rabbit');
const statusEl = document.getElementById('status');
const animateBtn = document.getElementById('animateBtn');
const randomBtn = document.getElementById('randomBtn');

function populateVariants(){
  Object.keys(variants).forEach(k=>{
    const opt = document.createElement('option');
    opt.value = k; opt.textContent = k; variantSelect.appendChild(opt);
  });
}

function setVariant(name){
  const frames = variants[name];
  rabbitEl.textContent = Array.isArray(frames)? frames[0] : frames;
  statusEl.textContent = `Status: showing ${name}`;
}

let animating = false;
async function animate(name){
  const frames = variants[name];
  if(!frames || frames.length<2) return;
  animating = true; animateBtn.textContent = 'Stop'; statusEl.textContent = 'Status: animating';
  let i=0;
  while(animating){
    rabbitEl.textContent = frames[i%frames.length];
    i++; await new Promise(r=>setTimeout(r,300));
  }
  animateBtn.textContent = 'Animate hop';
  statusEl.textContent = `Status: idle (last ${name})`;
}

animateBtn.addEventListener('click',()=>{
  if(animating){ animating=false; return; }
  animate(variantSelect.value);
});

randomBtn.addEventListener('click',()=>{
  const keys = Object.keys(variants); const pick = keys[Math.floor(Math.random()*keys.length)];
  variantSelect.value = pick; setVariant(pick);
});

variantSelect.addEventListener('change',()=> setVariant(variantSelect.value));

populateVariants(); variantSelect.value='classic'; setVariant('classic');
