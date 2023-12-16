const downloadSVG = document.querySelector('#downloadSVG');
downloadSVG.addEventListener('click', downloadSVGAsText);
let existingClasses = [];
let fileName = '';
let currentClassName = '';
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
            getAllClassNames();
            showPalette();
        }
    });
}

function getAllClassNames(){
    const newstyle = document.getElementById("mainssh");
    let elems = svg.querySelectorAll("path, rect, circle, ellipse, line, polyline, polygon, text");
    for (let i = 0; i < elems.length; i++) {
        // if class exist - add, if not add new (nc+i)
      let cName = elems[i].className.baseVal;
      if (cName == "") { 
        elems[i].setAttribute("class", "nc"+i);
        cName = "nc"+i;
        existingClasses.push(cName); 
      }
      else {
        existingClasses.push(cName);
      }
        // let cName = "nc"+i;
        // if ( elems[i].hasAttribute("className") ) {
        //     elems[i].removeAttribute("className");
        // }
        // else {
        //     elems[i].setAttribute("class", cName);
        //     existingClasses.push(cName); 
        // }
        newstyle.innerHTML = "." + cName + ":hover {cursor: pointer; fill: cyan;}\n"+newstyle.innerHTML;
        elems[i].addEventListener("click", showCSS);
    }
    existingClasses = Array.from(new Set(existingClasses)); //select only unique names
    document.body.prepend(newstyle);                 
}

function showPalette() {
    let data = [];
    for (let i = 0; i < existingClasses.length; i++) {
        data.push({ class: existingClasses[i], color: getFillByClassName(existingClasses[i]) });        
    }
    let container = document.getElementById("splitleft");
    let tableHTML = generateTable(data);
    container.innerHTML = tableHTML;
    let pickers = document.getElementById("colorpalette").getElementsByClassName("colorpicker");
    for (let i = 0; i < pickers.length; i++) {
        pickers[i].addEventListener('change', (evt) => {
            currentClassName = pickers[i].getAttribute("relatedTo");
            updateAll(evt,currentClassName);
        });
    }
}

function generateTable(data) { 
    let columns;
    if ( data.length > 150) {
        columns = 4;
    }
    else if (data.length > 100) {
        columns = 3;
    }
    else if (data.length > 30) {
        columns = 2;
    }
    else {
        columns = 1;
    }
    let tableheader = '<p style="font-weight: bold;margin-bottom: 0px;">Current colors</p><p style="margin-top: 0px;">To change color click on it</p>'
    tableheader += `<div id="container" style="column-count:${columns};">`;
    tableheader += '<table id="colorpalette" style="margin-left: auto;margin-right: auto;border-collapse: collapse; ">';  
    let table = "<tr style='border:1px dotted black;font-weight: normal;'><th>class</th><th>color</th>";  
    data.forEach(item => {  
        table += `<tr style='border:1px dotted black;padding:1px'><td>${item.class}</td><td ><toolcool-color-picker class="colorpicker" relatedTo="${item.class}" color="${item.color}"></toolcool-color-picker></td></tr>`;  
    });
    table += '</table></div>';
    table = tableheader + table;
    return table;  
}  


function showCSS(event){
    let className = event.currentTarget.className.baseVal;
    currentClassName = className;
    let table = document.getElementById("colorpalette");
    let trs = table.querySelectorAll('td');
    for (let i = 0; i < trs.length; i++) {
        if (trs[i].innerHTML == currentClassName) {
            trs[i].style.color = 'cyan';
        }
        else {
            trs[i].style.color = 'black';
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

function updateAll(event, classN) { // to change all elements of svg to selected color after the color picker is dismissed
    document.querySelectorAll("." + classN).forEach((p) => {
        p.style.fill = event.detail.hex8;
    });
    let table = document.getElementById("colorpalette");
    let trs = table.getElementsByTagName("th");
    Array.from(trs).forEach(item => {  
        item.style.color = 'black';  
    });

}

function getFillByClassName (classN) {
    const elems = svg.getElementsByClassName(classN);
    let cssObj = window.getComputedStyle(elems[0], null);
    let RGBcolor = cssObj.getPropertyValue("fill");
    let hex = parseColor(RGBcolor);
    return hex.hex;
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
