const downloadSVG = document.querySelector('#downloadSVG');
downloadSVG.addEventListener('click', downloadSVGAsText);
let fileName = '';
let svg;

uploadsvg();

function uploadsvg() {
    const fileInput = document.getElementById("inputfield");
    const svgoutput = document.querySelector(".svgoutput");
    fileInput.addEventListener("change", async () => {
        const [file] = fileInput.files;
        if (file) {
            svgoutput.innerHTML = await file.text();
            fileInput.style.display="none";
            //set new id for svg
            setIDtoSVG()
            fileName = file.name;
            //create a new stylesheet.  
            const newstyle = document.createElement('style');
            newstyle.setAttribute("id","mainssh");
            newstyle.setAttribute("type","text/css");
            document.body.prepend(newstyle); //Bacause we do not need it to save with modifyed image, we place this style outside svg
        }
        getTexts();
    });
}

function getTexts() {
    let texts = [];    
    let txts = svg.getElementsByTagName("text");
    const ssheet = document.getElementById("mainssh");
    for (let i = 0; i < txts.length; i++) {
        texts.push(txts[i].textContent);
        txts[i].setAttribute("id", "text"+i);
        ssheet.innerHTML = "#text" + i + ":hover {cursor: pointer; fill: cyan;}\n"+ssheet.innerHTML;
        txts[i].addEventListener("click", showCSS);
    }
//    return texts;
    generateInputs(texts);
}

function generateInputs(texts){
    let inputs = '';
    for (let i = 0; i < texts.length; i++) {
        inputs += `<p><input type="text" id="source${i}" placeholder="${texts[i]}" /></p>`;
    }
    let container = document.getElementById("splitleft");
    container.innerHTML = inputs;
    let sources = document.getElementsByTagName("input");
    for (let i = 0; i < sources.length; i++) {
        sources[i].addEventListener('input', inputHandler);        
        sources[i].addEventListener('focus', focusHandler);        
    }
}
function inputHandler(evt) {
    let num = (evt.currentTarget.id).substr(6);
    svg.getElementById("text"+num).textContent = evt.target.value;
}

function focusHandler(evt) {
    let txts = svg.getElementsByTagName("text");
    let num = (evt.currentTarget.id).substr(6);
    for (let i = 0; i < txts.length; i++) {
        if (txts[i].id == "text"+num) {
            txts[i].style.fill = 'cyan';
        }
        else {
            let cName = txts[i].className.baseVal;
            txts[i].style.fill  = get_style_rule_value(cName, "fill");
        }           
    }
}

function get_style_rule_value(selector, style) {
  const mysheet = document.styleSheets[1]; //because styleSheets[0] is mainssh
  const myrules = mysheet.cssRules;
  for (let j = 0; j < myrules.length; j++)
    {
        let pattern = new RegExp((selector+'[ ,{]|'+selector+'$'));
        if (pattern.test(myrules[j].selectorText) && (myrules[j].cssText.indexOf(style) > 1)) {
            let color = myrules[j].cssText.match(/rgb\(.*\)/g);
            if (color && color.length) {
                return parseColor(color[0]).hex;  
            }
        }
    }
 }

function showCSS(event){
     let iNum = (event.currentTarget.id).substr(4);
     let sources = document.getElementsByTagName("input");
     for (let i = 0; i < sources.length; i++) {
        if (sources[i].id == "source"+iNum) {
            sources[i].style.borderColor = 'cyan';
        }
        else {
            sources[i].style.borderColor = ''; // back to default color
        }           
     }
}

function setIDtoSVG(){
    svg = document.getElementsByTagName("svg")[0];
    if (svg && svg.hasAttribute("id")) {
        svg.removeAttribute("id");
    }
    svg.setAttribute("id","svgID");
}

function downloadSVGAsText() { //stolen from https://codepen.io/Alexander9111/pen/VwLaaPe
    const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
    const a = document.createElement('a');
    const e = new MouseEvent('click');
    a.download = fileName.slice(0,-4) + '_new.svg';
    a.href = 'data:image/svg+xml;base64,' + base64doc;
    a.dispatchEvent(e);
}
//2 functions to convert string ("rgb(210, 10, 10)" to hex. Stolen from https://stackoverflow.com/questions/13070054/convert-rgb-strings-to-hex-in-javascript
function parseColor(color) {
    var arr=[]; color.replace(/[\d+\.]+/g, function(v) { arr.push(parseFloat(v)); });
    return {
        hex: "#" + arr.slice(0, 3).map(toHex).join("")
        // ,
        // opacity: arr.length == 4 ? arr[3] : 1
    };
}

function toHex(int) {
    var hex = int.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

