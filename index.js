var currentAction=null;
function moveSelectAll(){
    var node=document.querySelector('#modelpreview2');
    for(var i=0;i<node.childElementCount;i++){
        if(node.childNodes[i].classList.contains('source')) continue;
        node.childNodes[i].classList.add('selected');
    }
}
function moveInvertSelect(){
    var node=document.querySelector('#modelpreview2');
    for(var i=0;i<node.childElementCount;i++){
        if(node.childNodes[i].classList.contains('source')) continue;
        node.childNodes[i].classList.toggle('selected');
    }
}
function moveCancelSelect(){
    var node=document.querySelector('#modelpreview2');
    for(var i=0;i<node.childElementCount;i++){
        node.childNodes[i].classList.remove('selected');
    }
}
function toggleScroll(node){
    materialCancel();
    regionCancel();
    if(node.scrollTop<=node.scrollHeight-node.offsetHeight-10){
        node.scrollTop=node.scrollHeight;
    }
    else{
        node.scrollTop=0;
    }
}
function moveDelete(){
    var node=document.body.querySelector('#model');
    var regions=node.querySelectorAll('div:not(.toggle):not(.title):not(.add)');
    var nodes=document.body.querySelectorAll('#modelpreview2>.selected');
    var toremove=[];
    for(var j=0;j<nodes.length;j++){
        for(var i=0;i<regions.length;i++){
            if(regions[i].type!='region') continue;
            if(regions[i].index==nodes[j].regionIndex){
                if(toremove.indexOf(regions[i])==-1){
                    toremove.push(regions[i]);
                }
                break;
            }
        }
    }
    window.nopreview=true;
    toremove.sort(function(a,b){
        return b.index-a.index;
    });
    for(var i=0;i<toremove.length;i++){
        deleteRegion.call(toremove[i].lastChild.previousSibling);
    }
    window.nopreview=false;
    node.classList.remove('editing-move');
    document.querySelector('#modelpreview2').classList.remove('highlight');
    moveCancelSelect();
    generatePreview();
}
function moveConfirm(){
    var node=document.body.querySelector('#model');
    var nodes=document.body.querySelectorAll('#modelpreview2>.selected');
    var dr=node.querySelector('input[name="dr"]');
    var dz=node.querySelector('input[name="dz"]');
    var cmd=node.querySelector('input[name="cmd"]');
    var changem=node.querySelector('select[name="changem"]');
    var transform=[dr.value||'0',dz.value||'0'];
    var cmd=cmd.value;
    dr.value='';
    dz.value='';
    cmd.value='';
    for(var i=0;i<transform.length;i++){
        try{
            transform[i]=eval(transform[i]);
            if(typeof transform[i]!='number'||isNaN(transform[i])){
                throw('err');
            }
        }
        catch(e){
            transform[i]=0;
        }
    }
    var regions=[];
    for(var j=0;j<nodes.length;j++){
        var i=nodes[j].regionIndex;
        if(config.region[i]&&regions.indexOf(i)==-1){
            regions.push(i);
        }
    }
    for(var j=0;j<regions.length;j++){
        var i=regions[j];
        var rs=eval(config.region[i][0]);
        var zs=eval(config.region[i][1]);
        var re=eval(config.region[i][2]);
        var ze=eval(config.region[i][3]);
        var mt=parseInt(config.region[i][4]);
        if(cmd){
            try{
                eval(cmd);
            }
            catch(e){}
        }
        config.region[i][0]=roundFloat(rs+transform[0]).toString();
        config.region[i][1]=roundFloat(zs+transform[1]).toString();
        config.region[i][2]=roundFloat(re+transform[0]).toString();
        config.region[i][3]=roundFloat(ze+transform[1]).toString();
        config.region[i][4]=mt.toString();
        if(changem.value!=-1){
            config.region[i][4]=changem.value;
        }
    }
    node.classList.remove('editing-move');
    document.querySelector('#modelpreview2').classList.remove('highlight');
    moveCancelSelect();
    generatePreview();
}
function moveCancel(){
    var node=document.body.querySelector('#model');
    var dr=node.querySelector('input[name="dr"]');
    var dz=node.querySelector('input[name="dz"]');
    var cmd=node.querySelector('input[name="cmd"]');
    dr.value='';
    dz.value='';
    cmd.value='';
    node.classList.remove('editing-move');
    document.querySelector('#modelpreview2').classList.remove('highlight');
    moveCancelSelect();
}
function moveRegion(e){
    materialCancel();
    regionCancel();
    moveCancel();
    if(e&&e.stopPropagation){
        e.stopPropagation();
    }
    var node=document.body.querySelector('#model');
    node.classList.add('editing-move');
    node.scrollTop=node.scrollHeight;
    var changem=node.querySelector('select[name="changem"]');
    changem.innerHTML='<option value="-1"><span>unchanged</span></option>';
    for(var i=0;i<config.material.length;i++){
        var option=document.createElement('option');
        option.value=i;
        if(config.material[i][4]){
            option.innerHTML='<span>'+config.material[i][4]+'</span>';
        }
        else{
            option.innerHTML='<span>material'+(i+1)+'</span>';
        }
        changem.appendChild(option);
    }
    document.querySelector('#modelpreview2').classList.add('highlight');
}
function hoverRegion(){
    var preview=document.body.querySelector('#modelpreview2');
    for(var i=0;i<preview.childElementCount;i++){
        if(preview.childNodes[i].regionIndex==this.index){
            preview.childNodes[i].classList.add('invert-color');
        }
    }
}
function blurRegion(){
    var preview=document.body.querySelectorAll('#modelpreview2>.invert-color');
    var list=[];
    for(var i=0;i<preview.length;i++){
        list.push(preview[i])
    }
    for(var i=0;i<list.length;i++){
        list[i].classList.remove('invert-color');
    }
}
function hoverMaterial(){
    var preview=document.body.querySelector('#modelpreview2');
    for(var i=0;i<preview.childElementCount;i++){
        if(preview.childNodes[i].materialIndex==this.index){
            preview.childNodes[i].classList.add('invert-color');
        }
    }
}
function blurMaterial(){
    var preview=document.body.querySelectorAll('#modelpreview2>.invert-color');
    var list=[];
    for(var i=0;i<preview.length;i++){
        list.push(preview[i])
    }
    for(var i=0;i<list.length;i++){
        list[i].classList.remove('invert-color');
    }
}
function importData(){
    var fileToLoad=this.files[0];
    if(fileToLoad){
        var fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent)
        {
            var data = fileLoadedEvent.target.result;
            var mrzindex=data.indexOf('mrz_config:');
            if(mrzindex==0){
                data=data.slice(11);
                localStorage.setItem('mrz_config',data);
                window.location.reload();
                return;
            }
            else if(mrzindex!=-1){
                data=data.slice(mrzindex+11,data.indexOf('&in000'));
                data=data.replace(/\n| |\r/g,'');
                data=LZString.decompressFromBase64(data);
                localStorage.setItem('mrz_config',data);
                window.location.reload();
                return;
            }
            var material={},jkllur=[];
            var rcvrloc1,rcvrloc2;
            if(data){
                data=data.replace(/ /g,'');
                data=data.replace(/\t/g,'');
                data=data.replace(/\r/g,'');
                data=data.split('\n');
                var stage=0;
                var config=window.config;
                for(var i=0;i<data.length;i++){
                    if(stage==0){
                        if(data[i]=='&in000'){
                            stage=1;
                        }
                    }
                    else{
                        var entry=data[i];
                        if(entry){
                            entry=entry.slice(0,entry.length-1);
                        }
                        if(entry.indexOf('=')!=-1){
                            stage=1;
                            entry=entry.split('=');
                            var index=entry[0].indexOf('(1)');
                            if(index!=-1){
                                entry[0]=entry[0].slice(0,index);
                            }
                            switch(entry[0]){
                                case 'rcvrfld':case 'srcfld':{
                                    config[entry[0]]=entry[1].slice(entry[1].indexOf("'")+1,entry[1].lastIndexOf("'"));
                                    break;
                                }
                                case 'rhomat':case 'cmat':case 'smat':case 'qmat':{
                                    material[entry[0]]=entry[1].split(',');
                                    break;
                                }
                                case 'jkllur':{
                                    jkllur.push(entry[1].split(','));
                                    stage=2;
                                    break;
                                }
                                case 'rcvrloc(1,1)':{
                                    config.rcvrloc1=entry[1].slice(entry[1].indexOf('*')+1);
                                    break;
                                }
                                case 'rcvrloc(1,2)':{
                                    entry[1]=entry[1].split(',');
                                    config.rcvrspacing=entry[1][1]-entry[1][0];
                                    config.rcvrloc2=entry[1][0];
                                    break;
                                }
                                default:{
                                    if(window.config.hasOwnProperty(entry[0])){
                                        window.config[entry[0]]=entry[1];
                                    }
                                }
                            }
                        }
                        else{
                            if(stage==2){
                                if(entry){
                                    entry=entry.split(',');
                                    if(entry.length==jkllur[0].length){
                                        jkllur.push(entry);
                                    }
                                }
                            }
                        }
                    }
                }
                config.material=[];
                config.region=jkllur;
                for(var i=0;i<material.rhomat.length;i++){
                    config.material.push([material.rhomat[i],material.cmat[i],material.smat[i],material.qmat[i]]);
                }
                for(var i=0;i<jkllur.length;i++){
                    for(var j=0;j<4;j++){
                        if(j%2==0){
                            jkllur[i][j]=roundFloat(jkllur[i][j]*config.deltar).toString();
                        }
                        else{
                            jkllur[i][j]=roundFloat(jkllur[i][j]*config.deltaz).toString();
                        }
                    }
                    jkllur[i][4]=(parseInt(jkllur[i][4])-1).toString();
                }
                config.srcj=roundFloat(config.srcj*config.deltar).toString();
                config.srck=roundFloat(config.srck*config.deltaz).toString();
                config.rcvrloc1=roundFloat(config.rcvrloc1*config.deltar).toString();
                config.rcvrloc2=roundFloat(config.rcvrloc2*config.deltaz).toString();
                config.rcvrspacing=roundFloat(config.rcvrspacing*config.deltaz).toString();
                config.unit='m';
                localStorage.setItem('mrz_config',JSON.stringify(config));
                window.location.reload();
            }
        };
        fileReader.readAsText(fileToLoad, "UTF-8");
    }
}
function hoverPreview(e){
    var region=false;
    var model=document.querySelector('#model');
    this.classList.add('invert-color2');
    for(var i=0;i<model.childNodes.length;i++){
        if(typeof model.childNodes[i].index=='number'){
            if(region){
                if(this.regionIndex==model.childNodes[i].index){
                    model.childNodes[i].classList.add('red');
                }
            }
            else{
                if(this.materialIndex==model.childNodes[i].index){
                    model.childNodes[i].classList.add('red');
                }
            }
        }
        else if(model.childNodes[i].classList&&model.childNodes[i].classList.contains('placeholder')){
            region=true;
        }
    }

    var pop=document.body.querySelector('#pop');
    var info=window.config.region[this.regionIndex];
    pop.childNodes[0].lastChild.innerHTML=info[0];
    pop.childNodes[1].lastChild.innerHTML=info[2];
    pop.childNodes[2].lastChild.innerHTML=info[1];
    pop.childNodes[3].lastChild.innerHTML=info[3];
    pop.classList.add('shown');

    var rect=this.getBoundingClientRect();
    var top0=rect.top;
    var height0=rect.height;
    if(top0<0){
        height0+=top0;
        top0=0;
    }
    if(top0+height0+10>document.body.offsetHeight){
        height0=document.body.offsetHeight-10-top0
    }
    var top=top0+(height0-107)/2;
    if(top<5){
        top=5;
    }
    if(top+112>document.body.offsetHeight){
        top=document.body.offsetHeight-112;
    }
    pop.style.top=top+'px';
}
function clickPreview(){
    if(window.transformed) return;
    if(this.parentNode.classList.contains('highlight')){
        this.classList.toggle('selected');
        if(!this.classList.contains('selected')){
            for(var i=0;i<this.parentNode.childElementCount;i++){
                if(this.parentNode.childNodes[i].regionIndex==this.regionIndex){
                    this.parentNode.childNodes[i].classList.remove('selected');
                }
            }
        }
        return;
    }
    var region=false;
    var model=document.querySelector('#model');
    for(var i=0;i<model.childNodes.length;i++){
        if(typeof model.childNodes[i].index=='number'){
            if(region){
                if(this.regionIndex==model.childNodes[i].index){
                    materialCancel();
                    regionCancel();
                    moveCancel();
                    var node=model.childNodes[i];
                    node.lastChild.click();
                    var dy=node.offsetTop-model.scrollTop-model.offsetHeight+250;
                    if(dy>0){
                        model.scrollTop+=dy+65;
                    }
                    else{
                        dy=node.offsetTop-model.scrollTop-40;
                        if(dy<0){
                            model.scrollTop+=dy;
                        }
                    }
                }
            }
        }
        else if(model.childNodes[i].classList&&model.childNodes[i].classList.contains('placeholder')){
            region=true;
        }
    }
}
function blurPreview(){
    this.classList.remove('invert-color2');
    var preview=document.body.querySelectorAll('.red');
    var list=[];
    for(var i=0;i<preview.length;i++){
        list.push(preview[i])
    }
    for(var i=0;i<list.length;i++){
        list[i].classList.remove('red');
    }
    var pop=document.body.querySelector('#pop');
    pop.classList.remove('shown');
}
function exportData(){
    saveConfig();
    var config=window.config;
    var maxr=0;
    var maxz=0;

    var regions=window.config.region;
    for(var i=0;i<regions.length;i++){
        var r=eval(regions[i][2]);
        var z=eval(regions[i][3]);
        if(r>maxr){
            maxr=r;
        }
        if(z>maxz){
            maxz=z;
        }
    }
    var deltar=eval(config.deltar);
    var deltaz=eval(config.deltaz);
    jmax=Math.round(maxr/deltar);
    kmax=Math.round(maxz/deltaz);

    var ndes=1;
    var str2='mrz_config:'+LZString.compressToBase64(JSON.stringify(config));
    var str3='';
    for(var i=0;i<str2.length;i++){
        str3+=str2[i];
        if((i+1)%80==0&&i<str2.length-1){
            str3+='\n';
            ndes++;
        }
    }
    str2=str2.slice(0,str2.length-1);
    var str=ndes+'\n'+str3;
    var map={
        m:1,
        cm:0.01,
        mm:0.001,
        inch:0.0254,
        ft:0.3048
    };
    str+='\n\n &in000\n\n'+
    ' mode = '+config.mode+',\n\n'+
    ' jmax = '+jmax+',\n'+
    ' deltar = '+roundFloat(eval(config.deltar)*map[config.unit])+',\n'+
    ' expand = '+eval(config.expand)+',\n'+
    ' jexpand1 = '+eval(config.jexpand1)+',\n'+
    ' jexpand2 = '+eval(config.jexpand2)+',\n'+
    ' kmax = '+kmax+',\n'+
    ' deltaz = '+roundFloat(eval(config.deltaz)*map[config.unit])+',\n'+
    ' tmax = '+eval(config.tmax)+',\n\n'+
    ' numblcks = '+config.region.length+',\n'+
    ' jkllur = ';
    for(var i=0;i<config.region.length;i++){
        if(i){
            str+='          '
        }
        for(var j=0;j<5;j++){
            if(j==0||j==2){
                str+=Math.round(eval(config.region[i][j])/deltar);
            }
            else if(j==1||j==3){
                str+=Math.round(eval(config.region[i][j])/deltaz);
            }
            else{
                str+=parseInt(config.region[i][j])+1;
            }
            str+=', ';
        }
        str+='\n';
    }
    str+='\n rhomat = ';
    for(var i=0;i<config.material.length;i++){
        str+=eval(config.material[i][0])+', ';
    }
    str+='\n cmat = ';
    for(var i=0;i<config.material.length;i++){
        str+=eval(config.material[i][1])+', ';
    }
    str+='\n smat = ';
    for(var i=0;i<config.material.length;i++){
        str+=eval(config.material[i][2])+', ';
    }
    str+='\n qmat = ';
    for(var i=0;i<config.material.length;i++){
        str+=eval(config.material[i][3])+', ';
    }
    var centfreq=parseFloat(config.centfreq);
    if(centfreq){
        if(config.ipulse=='1'||config.ipulse=='2'){
            str+='\n\n period = '+roundFloat(13/centfreq,true)+'e-4,\n';
        }
        else{
            str+='\n\n centfreq = '+centfreq+'e3,\n';
        }
    }
    else{
        str+='\n\n period = '+config.period+',\n';
    }
    str+=' ipulse = '+config.ipulse+',\n\n'+
    ' numsrcs = 1,\n'+
    ' srcj = '+Math.round(eval(config.srcj)/deltar)+',\n'+
    ' srck = '+Math.round(eval(config.srck)/deltaz)+',\n'+
    ' srcfld = \''+config.srcfld+'\',\n\n';
    var numrcvrs=config.numrcvrs;
    if(numrcvrs.indexOf(',')!=-1){
        numrcvrs=numrcvrs.split(',');
        var rcvrloc1=config.rcvrloc1.split(',');
        var rcvrloc2=config.rcvrloc2.split(',');
        var rcvrspacing=config.rcvrspacing.split(',');
        var numrcvrsx=0;
        for(var i=0;i<numrcvrs.length;i++){
            numrcvrsx+=parseInt(numrcvrs[i]);
        }
        var rcvrfld2;
        if(config.rcvrfld2){
            rcvrfld2=config.rcvrfld2.split(',');
            numrcvrsx*=(1+rcvrfld2.length);
        }
        else{
            rcvrfld2=[];
        }
        rcvrfld2.unshift(config.rcvrfld);
        str+=' numrcvrs = '+numrcvrsx+',\n';
        str+=' rcvrloc(1,1) = ';
        for(var k=0;k<rcvrfld2.length;k++){
            if(k>0){
                str+='\n                ';
            }
            for(var i=0;i<numrcvrs.length;i++){
                if(i>0){
                    str+='\n                ';
                }
                for(var j=0;j<parseInt(numrcvrs[i]);j++){
                    str+=Math.round(eval(rcvrloc1[i]||rcvrloc1[0])/deltar)+', ';
                }
            }
        }
        str+='\n rcvrloc(1,2) = ';
        for(var k=0;k<rcvrfld2.length;k++){
            if(k>0){
                str+='\n                ';
            }
            for(var i=0;i<numrcvrs.length;i++){
                if(i>0){
                    str+='\n                ';
                }
                for(var j=0;j<parseInt(numrcvrs[i]);j++){
                    str+=Math.round(eval(rcvrloc2[i]||rcvrloc2[0])/deltaz+j*eval(rcvrspacing[i]||rcvrspacing[0])/deltaz)+', ';
                }
            }
        }
        str+='\n rcvrfld = ';
        for(var k=0;k<rcvrfld2.length;k++){
            if(k>0){
                str+='\n           ';
            }
            for(var i=0;i<numrcvrs.length;i++){
                if(i>0){
                    str+='\n           ';
                }
                for(var j=0;j<parseInt(numrcvrs[i]);j++){
                    str+='\''+rcvrfld2[k]+'\',';
                }
            }
        }
    }
    else{
        var rcvrfld2;
        if(config.rcvrfld2){
            rcvrfld2=config.rcvrfld2.split(',');
            numrcvrs*=(1+rcvrfld2.length);
        }
        str+=' numrcvrs = '+numrcvrs+',\n'+
        ' rcvrloc(1,1) = '+numrcvrs+'*'+Math.round(eval(config.rcvrloc1)/deltar)+',\n'+
        ' rcvrloc(1,2) = ';
        for(var i=0;i<parseInt(config.numrcvrs);i++){
            str+=Math.round(eval(config.rcvrloc2)/deltaz+i*eval(config.rcvrspacing)/deltaz)+', ';
        }
        if(rcvrfld2){
            for(var j=0;j<rcvrfld2.length;j++){
                str+='\n                ';
                for(var i=0;i<parseInt(config.numrcvrs);i++){
                    str+=Math.round(eval(config.rcvrloc2)/deltaz+i*eval(config.rcvrspacing)/deltaz)+', ';
                }
            }
            rcvrfld2.unshift(config.rcvrfld);
            str+='\n rcvrfld = ';
            for(var j=0;j<rcvrfld2.length;j++){
                if(j){
                    str+='\n           ';
                }
                for(var i=0;i<parseInt(config.numrcvrs);i++){
                    str+='\''+rcvrfld2[j]+'\',';
                }
            }
        }
        else{
            str+='\n rcvrfld = ';
            str+=config.numrcvrs+'*\''+config.rcvrfld+'\',';
        }
    }
    str+='\n'+
    ' dtrec = '+config.dtrec+',\n\n';
    if(config.pictures=='1'){
        str+=' pictures = 1,\n';
    }
    if(config.nsnap){
        str+=' nsnap = '+(config.nsnap||0)+',\n\n';
    }
    str+=' zerosym = '+config.zerosym+',\n'+
    ' lindbc = '+config.lindbc+',\n'+
    ' nliao = 4,\n'+
    ' liaospeed = '+config.liaospeed+',\n'+
    ' twang = '+config.twang+',\n\n'+
    ' nqterms = 3,\n\n /';



    var textFileAsBlob = new Blob([str]);
    var fileNameToSaveAs = 'inputFile';
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.click();
}
function generatePreview(){
    if(window.nopreview) return;
    updateConfig();

    var maxr=0;
    var maxz=0;
    var maxc=0;
    var maxs=0;
    var maxrho=0;

    var regions=window.config.region;
    var materials=window.config.material;
    for(var i=0;i<regions.length;i++){
        var r=eval(regions[i][2]);
        var z=eval(regions[i][3]);
        if(r>maxr){
            maxr=r;
        }
        if(z>maxz){
            maxz=z;
        }
    }
    for(var i=0;i<materials.length;i++){
        var c=eval(materials[i][1]);
        var s=eval(materials[i][2]);
        var rho=eval(materials[i][0]);
        if(c>maxc){
            maxc=c;
        }
        if(s>maxs){
            maxs=s;
        }
        if(rho>maxrho){
            maxrho=rho;
        }
    }
    var preview=document.body.querySelector('#modelpreview2');
    preview.innerHTML='';
    for(var i=0;i<regions.length;i++){
        var node=document.createElement('div');
        node.regionIndex=i;
        node.materialIndex=parseInt(regions[i][4]);
        var color=materials[node.materialIndex][5],color2='';
        if(color){
            if(color.indexOf('|')!=-1){
                color=color.split('|');
                color2=color[1];
                color=color[0];
            }
            else if(color.indexOf('(')==-1&&color.indexOf(',')!=-1){
                color2=color.split(',');
                if(color2.length==3){
                    color='rgb('+color2[0]+','+color2[1]+','+color2[2]+')';
                    var p=0.8-0.5*(parseInt(color2[0])+parseInt(color2[1])+parseInt(color2[2]))/(3*255);
                    color2='rgba('+color2[0]+','+color2[1]+','+color2[2]+','+p+')';
                }
                else{
                    color2=color;
                }
            }
            else{
                node.style.background=color;
            }
        }
        else{
            var p=0.3+0.5*(eval(materials[node.materialIndex][0])/maxrho+
                eval(materials[node.materialIndex][1])/maxc+
                eval(materials[node.materialIndex][2])/maxs)/3;
            color='rgb('+Math.round(255*(1-eval(materials[node.materialIndex][0])/maxrho))+','+
                Math.round(255*(1-eval(materials[node.materialIndex][1])/maxc))+','+
                Math.round(255*(1-eval(materials[node.materialIndex][2])/maxs))+')';
            color2='rgba('+Math.round(255*(1-eval(materials[node.materialIndex][0])/maxrho))+','+
                Math.round(255*(1-eval(materials[node.materialIndex][1])/maxc))+','+
                Math.round(255*(1-eval(materials[node.materialIndex][2])/maxs))+','+p+')';
        }
        if(color2){
            if(eval(regions[i][0])/maxr*50==0){
                node.style.background='linear-gradient(to right,'+color2+','+color2+','+color+')';
            }
            else{
                node.style.background='linear-gradient(to right,'+color+','+color2+','+color2+','+color+')';
            }
        }
        node.style.width=((eval(regions[i][2])-eval(regions[i][0]))/maxr*50)+'%';
        node.style.height=((eval(regions[i][3])-eval(regions[i][1]))/maxz*100)+'%';
        node.style.left=(50+eval(regions[i][0])/maxr*50)+'%';
        node.style.top=(eval(regions[i][1])/maxz*100)+'%';
        node.onclick=clickPreview;
        node.onmouseenter=hoverPreview;
        node.onmouseleave=blurPreview;
        preview.appendChild(node);
        var node2=node.cloneNode();
        node2.regionIndex=i;
        node2.materialIndex=parseInt(regions[i][4]);
        node2.style.left=(50-eval(regions[i][2])/maxr*50)+'%';
        node2.onclick=clickPreview;
        node2.onmouseenter=hoverPreview;
        node2.onmouseleave=blurPreview;
        node2.style.transform='rotateY(180deg)';
        preview.appendChild(node2);
    }

    var source=document.createElement('div');
    source.classList.add('source');
    source.style.left=(eval(config.srcj)/maxr*50+50)+'%';
    source.style.top=(eval(config.srck)/maxz*100)+'%';
    var source2=source.cloneNode();
    source.style.left=(50-eval(config.srcj)/maxr*50)+'%';
    preview.appendChild(source);
    preview.appendChild(source2);

    var rcvr=function(numrcvrs,rcvrloc1,rcvrloc2,rcvrspacing){
        for(var i=0;i<parseInt(numrcvrs);i++){
            var receiver=document.createElement('div');
            receiver.classList.add('source');
            receiver.classList.add('receiver');
            receiver.style.left=(eval(rcvrloc1)/maxr*50+50)+'%';
            receiver.style.top=((eval(rcvrloc2)+i*rcvrspacing)/maxz*100)+'%';
            var receiver2=receiver.cloneNode();
            receiver.style.left=(50-eval(rcvrloc1)/maxr*50)+'%';
            preview.appendChild(receiver);
            preview.appendChild(receiver2);
        }
    }
    if(config.numrcvrs.indexOf(',')!=-1){
        var numrcvrs=config.numrcvrs.split(',');
        var rcvrloc1=config.rcvrloc1.split(',');
        var rcvrloc2=config.rcvrloc2.split(',');
        var rcvrspacing=config.rcvrspacing.split(',');
        for(var i=0;i<numrcvrs.length;i++){
            rcvr(numrcvrs[i],rcvrloc1[i]||rcvrloc1[0],rcvrloc2[i]||rcvrloc2[0],rcvrspacing[i]||rcvrspacing[0]);
        }
    }
    else{
        rcvr(config.numrcvrs,config.rcvrloc1,config.rcvrloc2,config.rcvrspacing);
    }
}
function materialConfirm(){
    var node=document.body.querySelector('#model');
    var rho=node.querySelector('input[name="rho"]');
    var vc=node.querySelector('input[name="vc"]');
    var vs=node.querySelector('input[name="vs"]');
    var q=node.querySelector('input[name="q"]')||0;
    var des=node.querySelector('input[name="des"]');
    var clr=node.querySelector('input[name="clr"]');
    var info;
    try{
        info=[rho.value,vc.value,vs.value,q.value,des.value,clr.value];
        for(var i=0;i<4;i++){
            var n=eval(info[i]);
            if(typeof n!='number'||isNaN(n)){
                info[i]='0';
            }
        }
    }
    catch(e){
        alert('Input error');
        return;
    }
    if(currentAction=='addMaterial'){
        addMaterial(info,window.config.material.length);
        window.config.material.push(info);
    }
    else if(Array.isArray(currentAction)&&currentAction[0]=='editMaterial'){
        window.config.material[currentAction[1]]=info;
    }
    var materials=node.querySelectorAll('div:not(.toggle):not(.title):not(.add)');
    for(var i=0;i<materials.length;i++){
        if(materials[i].type!='material') continue;
        if(materials[i].index==currentAction[1]){
            if(info[4]){
                materials[i].firstChild.innerHTML=info[4];
                materials[i].strfixed=true;
            }
            else{
                materials[i].firstChild.innerHTML='material'+(materials[i].index+1);
                materials[i].strfixed=false;
            }
            break;
        }
    }
    if(info[4]){
        var m=document.body.querySelector('select[name="regionmaterial"]');
        for(var i=0;i<m.childNodes.length;i++){
            if(m.childNodes[i].value==currentAction[1]){
                m.childNodes[i].innerHTML=info[4];
            }
        }
    }
    rho.value='';
    vc.value='';
    vs.value='';
    q.value='';
    des.value='';
    clr.value='';
    node.classList.remove('editing-material');

    var regions=node.querySelectorAll('div:not(.toggle):not(.title):not(.add)');
    for(var i=0;i<regions.length;i++){
        if(regions[i].type!='region') continue;
        var regioninfo=window.config.region[regions[i].index];
        if(regioninfo&&!regioninfo[5]&&regioninfo[4]==currentAction[1]){
            regions[i].firstChild.innerHTML=''+(regions[i].index+1);
            regions[i].strfixed=false;
            if(info[4]){
                regions[i].firstChild.innerHTML+=' - '+info[4];
            }
            else{
                regions[i].firstChild.innerHTML+=' - material'+(parseInt(currentAction[1])+1);
            }
        }
    }
    generatePreview();
}
function regionConfirm(){
    var node=document.body.querySelector('#model');
    var ba=node.querySelector('input[name="ba"]');
    var rs=node.querySelector('input[name="rs"]');
    var re=node.querySelector('input[name="re"]');
    var zs=node.querySelector('input[name="zs"]');
    var ze=node.querySelector('input[name="ze"]');
    var m=node.querySelector('select[name="regionmaterial"]');
    var des=node.querySelector('input[name="rdes"]');
    if(ba.value&&currentAction=='addRegion'){
        var bainfo=ba.value.split(',');
        var dr=eval(bainfo[2])||0;
        var dz=eval(bainfo[1])||0;
        var rs0=eval(rs.value);
        var re0=eval(re.value);
        var zs0=eval(zs.value);
        var ze0=eval(ze.value);
        var des0=des.value;
        if(bainfo.length>=2){
            ba.value='';
            window.nopreview=true;
            for(var i=0;i<parseInt(bainfo[0]);i++){
                rs.value=roundFloat(rs0+dr*i);
                re.value=roundFloat(re0+dr*i);
                zs.value=roundFloat(zs0+dz*i);
                ze.value=roundFloat(ze0+dz*i);
                des.value=des0;
                regionConfirm();
            }
            window.nopreview=false;
            generatePreview();
            return;
        }
    }
    var info;
    try{
        info=[rs.value,zs.value,re.value,ze.value,m.value,des.value];
        for(var i=0;i<4;i++){
            var n=eval(info[i]);
            if(typeof n!='number'||isNaN(n)){
                info[i]='0';
            }
        }
    }
    catch(e){
        alert('Input error');
        return;
    }
    if(currentAction=='addRegion'){
        addRegion(info,window.config.region.length);
        window.config.region.push(info);
    }
    else if(Array.isArray(currentAction)&&currentAction[0]=='editRegion'){
        window.config.region[currentAction[1]]=info;
    }
    var regions=node.querySelectorAll('div:not(.toggle):not(.title):not(.add)');
    for(var i=0;i<regions.length;i++){
        if(regions[i].type!='region') continue;
        if(regions[i].index==currentAction[1]){
            if(info[5]){
                regions[i].firstChild.innerHTML=info[5];
                regions[i].strfixed=true;
            }
            else{
                regions[i].firstChild.innerHTML=''+(regions[i].index+1);
                regions[i].strfixed=false;
                var material=config.material[info[4]];
                if(material&&material[4]){
                    regions[i].firstChild.innerHTML+=' - '+material[4];
                }
                else{
                    regions[i].firstChild.innerHTML+=' - material'+(parseInt(info[4])+1);
                }
            }
            break;
        }
    }
    rs.value='';
    re.value='';
    zs.value='';
    ze.value='';
    des.value='';
    ba.value='';
    node.classList.remove('editing-region');
    generatePreview();
}
function materialCancel(){
    var node=document.body.querySelector('#model');
    var rho=node.querySelector('input[name="rho"]');
    var vc=node.querySelector('input[name="vc"]');
    var vs=node.querySelector('input[name="vs"]');
    var q=node.querySelector('input[name="q"]');
    var des=node.querySelector('input[name="des"]');
    var clr=node.querySelector('input[name="clr"]');
    rho.value='';
    vc.value='';
    vs.value='';
    q.value='';
    des.value='';
    clr.value='';
    node.classList.remove('editing-material');
}
function addMaterialButton(){
    materialCancel();
    regionCancel();
    moveCancel();
    var node=document.body.querySelector('#model');
    node.classList.add('editing-material');
    currentAction='addMaterial';
    var rho=node.querySelector('input[name="rho"]');
    var vc=node.querySelector('input[name="vc"]');
    var vs=node.querySelector('input[name="vs"]');
    var q=node.querySelector('input[name="q"]');
    var des=node.querySelector('input[name="des"]');
    var clr=node.querySelector('input[name="clr"]');
    var placeholder=node.querySelector('.placeholder');
    node.insertBefore(rho.parentNode,placeholder);
    node.insertBefore(vc.parentNode,placeholder);
    node.insertBefore(vs.parentNode,placeholder);
    node.insertBefore(q.parentNode,placeholder);
    node.insertBefore(des.parentNode,placeholder);
    node.insertBefore(clr.parentNode,placeholder);
    node.insertBefore(node.querySelector('.confirm.material'),placeholder);
}
function regionCancel(){
    var node=document.body.querySelector('#model');
    var rs=node.querySelector('input[name="rs"]');
    var re=node.querySelector('input[name="re"]');
    var zs=node.querySelector('input[name="zs"]');
    var ze=node.querySelector('input[name="ze"]');
    var ba=node.querySelector('input[name="ba"]');
    var des=node.querySelector('input[name="rdes"]');
    rs.value='';
    re.value='';
    zs.value='';
    ze.value='';
    ba.value='';
    des.value='';
    node.classList.remove('editing-region');
}
function addRegionButton(){
    materialCancel();
    regionCancel();
    moveCancel();
    var node=document.body.querySelector('#model');
    node.classList.add('editing-region');
    currentAction='addRegion';
    var rs=node.querySelector('input[name="rs"]');
    var re=node.querySelector('input[name="re"]');
    var zs=node.querySelector('input[name="zs"]');
    var ze=node.querySelector('input[name="ze"]');
    var ba=node.querySelector('input[name="ba"]');
    var m=node.querySelector('select[name="regionmaterial"]');
    var des=node.querySelector('input[name="rdes"]');
    ba.parentNode.style.display='';
    node.appendChild(rs.parentNode);
    node.appendChild(re.parentNode);
    node.appendChild(zs.parentNode);
    node.appendChild(ze.parentNode);
    node.appendChild(ba.parentNode);
    node.appendChild(des.parentNode);
    node.appendChild(m.parentNode);
    node.appendChild(node.querySelector('.confirm.region'));

    node.scrollTop=node.scrollHeight;
}
function editRegion(e){
    if(e&&e.stopPropagation){
        e.stopPropagation();
    }
    var node=document.body.querySelector('#model');
    node.classList.add('editing-region');
    currentAction=['editRegion',this.parentNode.index];
    var rs=node.querySelector('input[name="rs"]');
    var re=node.querySelector('input[name="re"]');
    var zs=node.querySelector('input[name="zs"]');
    var ze=node.querySelector('input[name="ze"]');
    var ba=node.querySelector('input[name="ba"]');
    var des=node.querySelector('input[name="rdes"]');
    var m=node.querySelector('select[name="regionmaterial"]');
    var info=window.config.region[this.parentNode.index];
    ba.parentNode.style.display='none';
    rs.value=info[0];
    re.value=info[2];
    zs.value=info[1];
    ze.value=info[3];
    m.value=info[4];
    des.value=info[5]||'';
    node.insertBefore(node.querySelector('.confirm.region'),this.parentNode.nextSibling);
    node.insertBefore(m.parentNode,this.parentNode.nextSibling);
    node.insertBefore(des.parentNode,this.parentNode.nextSibling);
    node.insertBefore(ze.parentNode,this.parentNode.nextSibling);
    node.insertBefore(zs.parentNode,this.parentNode.nextSibling);
    node.insertBefore(re.parentNode,this.parentNode.nextSibling);
    node.insertBefore(rs.parentNode,this.parentNode.nextSibling);

    var model=node;
    var node=this.parentNode;
    var dy=node.offsetTop-model.scrollTop-model.offsetHeight+250;
    if(dy>0){
        model.scrollTop+=dy+65;
    }
    else{
        dy=node.offsetTop-model.scrollTop-40;
        if(dy<0){
            model.scrollTop+=dy;
        }
    }
}
function editMaterial(e){
    if(e&&e.stopPropagation){
        e.stopPropagation();
    }
    var node=document.body.querySelector('#model');
    node.classList.add('editing-material');
    currentAction=['editMaterial',this.parentNode.index];
    var rho=node.querySelector('input[name="rho"]');
    var vc=node.querySelector('input[name="vc"]');
    var vs=node.querySelector('input[name="vs"]');
    var q=node.querySelector('input[name="q"]');
    var des=node.querySelector('input[name="des"]');
    var clr=node.querySelector('input[name="clr"]');
    var info=window.config.material[this.parentNode.index];
    rho.value=info[0];
    vc.value=info[1];
    vs.value=info[2];
    q.value=info[3];
    des.value=info[4]||'';
    clr.value=info[5]||'';
    node.insertBefore(node.querySelector('.confirm.material'),this.parentNode.nextSibling);
    node.insertBefore(clr.parentNode,this.parentNode.nextSibling);
    node.insertBefore(des.parentNode,this.parentNode.nextSibling);
    node.insertBefore(q.parentNode,this.parentNode.nextSibling);
    node.insertBefore(vs.parentNode,this.parentNode.nextSibling);
    node.insertBefore(vc.parentNode,this.parentNode.nextSibling);
    node.insertBefore(rho.parentNode,this.parentNode.nextSibling);
}
function deleteMaterial(e){
    if(e&&e.stopPropagation){
        e.stopPropagation();
    }
    regionCancel();
    materialCancel();
    moveCancel();
    var node=document.body.querySelector('#model');
    var index=this.parentNode.index;
    for(var i=0;i<window.config.region.length;i++){
        if(parseInt(window.config.region[i][4])==index){
            alert('This material is used by at least one region, unable to delete');
            return;
        }
    }
    var m=document.body.querySelector('select[name="regionmaterial"]');
    m.lastChild.remove();
    for(var i=0;i<window.config.region.length;i++){
        var index2=parseInt(window.config.region[i][4]);
        if(index2>index){
            window.config.region[i][4]=(index2-1).toString();
        }
    }
    var materials=node.querySelectorAll('div:not(.toggle):not(.title):not(.add)');
    for(var i=0;i<materials.length;i++){
        if(materials[i].type!='material') continue;
        if(materials[i].index>index){
            materials[i].index--;
            if(!materials[i].strfixed){
                materials[i].firstChild.innerHTML='material'+(materials[i].index+1);
            }
        }
    }
    config.material.splice(index,1);
    var regions=node.querySelectorAll('div:not(.toggle):not(.title):not(.add)');
    for(var i=0;i<regions.length;i++){
        if(regions[i].type!='region') continue;
        if(regions[i].strfixed) continue;
        var regioninfo=window.config.region[regions[i].index];
        var materialinfo=window.config.material[regioninfo[4]];
        if(materialinfo[4]) continue;
        regions[i].firstChild.innerHTML=''+(regions[i].index+1)+' - material'+(parseInt(regioninfo[4])+1);
    }
    for(var i=0;i<m.childNodes.length;i++){
        var info=window.config.material[m.childNodes[i].value];
        if(info&&info[4]){
            m.childNodes[i].innerHTML=info[4];
            m.childNodes[i].strfixed=true;
        }
        else{
            m.childNodes[i].strfixed=false;
        }
    }
    this.parentNode.remove();
    generatePreview();
}
function deleteRegion(e){
    if(e&&e.stopPropagation){
        e.stopPropagation();
    }
    materialCancel();
    regionCancel();
    moveCancel();
    var node=document.body.querySelector('#model');
    var index=this.parentNode.index;
    var regions=node.querySelectorAll('div:not(.toggle):not(.title):not(.add)');
    for(var i=0;i<regions.length;i++){
        if(regions[i].type!='region') continue;
        if(regions[i].index>index){
            regions[i].index--;
            if(!regions[i].strfixed){
                var str=regions[i].firstChild.innerHTML;
                str=str.slice(str.indexOf(' - '));
                regions[i].firstChild.innerHTML=''+(regions[i].index+1)+str;
            }
        }
    }
    config.region.splice(index,1);
    this.parentNode.remove();
    generatePreview();
}
function addMaterial(info,index){
    var node=document.body.querySelector('#model');
    var div=document.createElement('div');
    div.type='material';
    div.index=index;
    if(info[4]){
        div.innerHTML='<span>'+info[4]+'</span>';
        div.strfixed=true;
    }
    else{
        div.innerHTML='<span>material'+(div.index+1)+'</span>';
    }
    div.onmouseenter=hoverMaterial;
    div.onmouseleave=blurMaterial;
    var editButton=document.createElement('input');
    editButton.type='button';
    editButton.value='edit';
    editButton.onclick=editMaterial;
    editButton.style.display='none';
    var deleteButton=document.createElement('input');
    deleteButton.type='button';
    deleteButton.value='delete';
    deleteButton.onclick=deleteMaterial;
    div.appendChild(deleteButton);
    div.appendChild(editButton);
    node.insertBefore(div,node.querySelector('.add.material'));
    var m=document.body.querySelector('select[name="regionmaterial"]');
    var option=document.createElement('option');
    option.value=div.index.toString();
    option.innerHTML=div.innerHTML;
    div.onclick=clickRegion;
    m.appendChild(option);
}
function addRegion(info,index){
    var node=document.body.querySelector('#model');
    var div=document.createElement('div');
    div.type='region';
    div.index=index;
    if(info[5]){
        div.innerHTML='<span>'+info[5]+'</span>';
        div.strfixed=true;
    }
    else{
        div.innerHTML='<span>'+(div.index+1)+'</span>';
        var material=config.material[info[4]];
        if(material&&material[4]){
            div.firstChild.innerHTML+=' - '+material[4];
        }
        else{
            div.firstChild.innerHTML+=' - material'+(parseInt(info[4])+1);
        }
    }
    div.onmouseenter=hoverRegion;
    div.onmouseleave=blurRegion;
    var editButton=document.createElement('input');
    editButton.type='button';
    editButton.value='edit';
    editButton.onclick=editRegion;
    editButton.style.display='none';
    var deleteButton=document.createElement('input');
    deleteButton.type='button';
    deleteButton.value='delete';
    deleteButton.onclick=deleteRegion;
    div.appendChild(deleteButton);
    div.appendChild(editButton);
    div.onclick=clickRegion;
    node.insertBefore(div,node.querySelector('.add.region'));
}
function clickRegion(){
    materialCancel();
    regionCancel();
    moveCancel();
    this.lastChild.click();
}
function roundFloat(num,string){
    if(typeof num=='string'){
        num=eval(num);
    }
    num=num*1000000;
    if(Math.abs(num-Math.round(num))<1e-2){
        num=Math.round(num)/1000000;
        if(string){
            num=num.toString();
            if(num.indexOf('.')==-1){
                num+='.0';
            }
        }
        return num;
    }
    else if(string){
        num=Math.round(num)/1000000;
        num=num.toString();
        if(num.indexOf('.')==-1){
            num+='.0';
        }
        return num;
    }
    else{
        num=num*3;
        if(Math.abs(num-Math.round(num))<1e-2){
            return Math.round(num)/1000000+'/'+3;
        }
        return num/3000000;
    }
}
function changeUnit(){
    var unit1=window.config.unit;
    var unit2=document.body.querySelector('select[name="unit"]').value;

    updateConfig();
    var units=document.body.querySelectorAll('span.unit');
    var map1={
        m:'m',
        cm:'cm',
        mm:'mm',
        inch:'in',
        ft:'ft',
    };
    var map2={
        m:10000,
        cm:100,
        mm:10,
        inch:254,
        ft:3048
    };
    for(var i=0;i<units.length;i++){
        var input=units[i].parentNode.querySelector('input');
        units[i].innerHTML=map1[unit2];
        if(!input.value) continue;
        try{
            input.value=roundFloat(eval(input.value)*map2[unit1]/map2[unit2]);
        }
        catch(e){
            input.value='';
        }
        window.config[input.name]=input.value;
    }
    for(var i=0;i<window.config.region.length;i++){
        for(var j=0;j<4;j++){
            window.config.region[i][j]=roundFloat(eval(window.config.region[i][j])*map2[unit1]/map2[unit2]).toString();
        }
    }
}
function loadConfig(){
    var options=document.body.querySelectorAll('select:not(.toggle),input[type="text"]:not(.toggle)');
    for(var i=0;i<options.length;i++){
        if(window.config[options[i].name]!=undefined){
            options[i].value=window.config[options[i].name];
        }
        if(options[i].type=='text'&&!options[i].onblur){
            options[i].onblur=updateConfig;
        }
    }
    var map={
        m:'m',
        cm:'cm',
        mm:'mm',
        inch:'in',
        ft:'ft',
    };
    var units=document.querySelectorAll('.unit');
    for(var i=0;i<units.length;i++){
        units[i].innerHTML=map[window.config.unit];
    }
    for(var i=0;i<window.config.material.length;i++){
        addMaterial(window.config.material[i],i);
    }
    for(var i=0;i<window.config.region.length;i++){
        addRegion(window.config.region[i],i);
    }
}
function updateConfig(){
    var options=document.body.querySelectorAll('select:not(.toggle),input[type="text"]:not(.toggle)');
    for(var i=0;i<options.length;i++){
        if(options[i].name=='des'||options[i].name=='rdes'||options[i].name=='clr'||options[i].name=='changem') continue;
        if(options[i].name=='numrcvrs'||options[i].name=='rcvrloc1'||options[i].name=='rcvrspacing'||options[i].name=='rcvrloc2'){
            try{
                var nn=options[i].value.split(',');
                for(var ni=0;ni<nn.length;ni++){
                    var n=eval(nn[ni]);
                    if(typeof n!='number'||isNaN(n)){
                        throw('err');
                    }
                }
            }
            catch(e){
                alert('Input error：'+options[i].name);
                options[i].value=window.config[options[i].name];
            }
        }
        else if(options[i].name=='nsnap'||options[i].name=='centfreq'||options[i].name=='period'){
            if(options[i].value){
                try{
                    var n=eval(options[i].value);
                    if(typeof n!='number'||isNaN(n)){
                        throw('err');
                    }
                }
                catch(e){
                    alert('Input error：'+options[i].name);
                    options[i].value=window.config[options[i].name];
                }
            }
        }
        else if(options[i].type=='text'&&options[i].name!='rcvrfld2'){
            try{
                var n=eval(options[i].value);
                if(typeof n!='number'||isNaN(n)){
                    throw('err');
                }
            }
            catch(e){
                alert('Input error：'+options[i].name);
                options[i].value=window.config[options[i].name];
            }
        }
        window.config[options[i].name]=options[i].value;
    }
}
function saveConfig(node){
    if(node&&node.value=='save'){
        node.value='finished';
        node.style.color='grey';
        setTimeout(function(){
            node.value='save';
            node.style.color='';
        },500);
    }
    updateConfig();
    localStorage.setItem('mrz_config',JSON.stringify(window.config));
}
function exportConfig(){
    saveConfig();
    var str='mrz_config:'+JSON.stringify(window.config);
    var textFileAsBlob = new Blob([str]);
    var fileNameToSaveAs = 'mrzConfig';
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.click();
}
function clearConfig(){
    localStorage.removeItem('mrz_config');
    window.location.reload();
}
function init(){
    var config;
    try{
        config=JSON.parse(localStorage.getItem('mrz_config'));
        if(!config.unit){
            throw('err');
        }
    }
    catch(e){
        config={
            unit:'m',
            deltar:'0.00127',
            expand:'1.005',
            jexpand1:'153',
            jexpand2:'400',
            deltaz:'0.00254',
            tmax:'5.12e-3',
            lindbc:'1',
            zerosym:'1',
            liaospeed:'1',
            twang:'0.993',
            mode:'0',
            centfreq:'10',
            ipulse:'1',
            srcj:'0.0635',
            srck:'0',
            srcfld:'p',
            numrcvrs:'13',
            rcvrspacing:'0.1524',
            rcvrloc1:'0.0635',
            rcvrloc2:'4.064',
            rcvrfld:'p',
            rcvrfld2:'',
            dtrec:'10e-06',
            nsnap:'',
            material:[
                ['1000','1524','0','0','water'],
                ['2000','5026.7','3060','0','ground'],
            ],
            region:[
                ['0','0','0.13335','7.62','0'],
                ['0.13335','0','0.508','7.62','1'],
            ]
        }
    }
    window.config=config;
    loadConfig();
    generatePreview();

    var fig=document.querySelector('#modelpreview2');
    fig.transform={
        translate:[0,0],
        scale:1
    }
    fig.updateTransform=function(){
        var transform=this.transform;
        var dx=fig.parentNode.offsetWidth*(transform.scale-1)/2;
        if(transform.translate[0]>dx){
            transform.translate[0]=dx;
        }
        if(transform.translate[0]<-dx){
            transform.translate[0]=-dx;
        }
        var dy=Math.max(0,fig.parentNode.offsetHeight*(transform.scale-1)/2-40);
        if(transform.translate[1]>dy){
            transform.translate[1]=dy;
        }
        if(transform.translate[1]<-dy){
            transform.translate[1]=-dy;
        }

        if(transform.scale>1){
            fig.parentNode.classList.add('zoomed');
        }
        else{
            transform.translate=[0,0];
            fig.parentNode.classList.remove('zoomed');
            fig.parentNode.scrollTop=0;
        }
        this.style.width='calc('+(transform.scale*100)+'% - 40px)';
        this.style.height='calc('+(transform.scale*100)+'% - 120px)';
        this.style.left='calc('+(50-transform.scale*50)+'% + 20px)';
        this.style.top='calc('+(50-transform.scale*50)+'% + 60px)';
        this.style.transform='translate('+this.transform.translate[0]+'px,'+this.transform.translate[1]+'px)';
    }
    fig.parentNode.onmousewheel=function(e){
        var transform=fig.transform;
        if(e.wheelDelta>0){
            if(transform.scale>=1){
                transform.scale*=1.2;
            }
            else{
                transform.scale+=0.2;
            }
        }
        else if(e.wheelDelta<0&&transform.scale>1){
            if(transform.scale>=1){
                transform.scale/=1.2;
            }
            else{
                transform.scale-=0.2;
            }
        }
        fig.updateTransform();
    }
    fig.parentNode.oncontextmenu=function(){
        fig.transform={
            translate:[0,0],
            scale:1
        }
        fig.updateTransform();
    }
    fig.parentNode.onmousedown=function(e){
        if(e.which==2){
            if(fig.classList.contains('highlight')){
                fig.selection={
                    origin:[e.x,e.y]
                }
            }
            return;
        }
        if(fig.transform.scale<=1) return;
        fig.transform.event=[e.x,e.y];
        fig.transform.origin=fig.transform.translate.slice(0);
    }
    document.addEventListener('mousemove',function(e){
        if(fig.selection){
            if(e.which!=2){
                if(fig.selection.node) fig.selection.node.remove();
                delete fig.selection;
                return;
            }
            if(!fig.selection.node){
                if(Math.sqrt((e.x-fig.selection.origin[0])*(e.x-fig.selection.origin[0])+
                (e.y-fig.selection.origin[1])*(e.y-fig.selection.origin[1]))>5){
                    fig.selection.node=document.createElement('div');
                    fig.selection.node.classList.add('selectnode');
                    document.body.appendChild(fig.selection.node);
                }
                else{
                    return;
                }
            }
            var node=fig.selection.node;
            var lmin=Math.min(e.x,fig.selection.origin[0]);
            var tmin=Math.min(e.y,fig.selection.origin[1]);
            var width=Math.abs(e.x-fig.selection.origin[0]);
            var height=Math.abs(e.y-fig.selection.origin[1]);
            var lmax=lmin+width;
            var tmax=tmin+height;
            node.style.left=lmin+'px';
            node.style.top=tmin+'px';
            node.style.width=width+'px';
            node.style.height=height+'px';
            for(var i=0;i<fig.childElementCount;i++){
                if(fig.childNodes[i].classList.contains('source')) continue;
                var rect=fig.childNodes[i].getBoundingClientRect();
                if(rect.left>lmax||rect.left+rect.width<lmin||
                    rect.top>tmax||rect.top+rect.height<tmin){
                    fig.childNodes[i].classList.remove('selected');
                }
                else{
                    fig.childNodes[i].classList.add('selected');
                }
            }
            return;
        }
    });
    document.addEventListener('mouseleave',function(){
        if(fig.selection&&fig.selection.node) fig.selection.node.remove();
        delete fig.selection;
    });
    document.addEventListener('mouseup',function(){
        setTimeout(function(){
            for(var i=0;i<fig.childElementCount;i++){
                if(fig.childNodes[i].classList.contains('selected')){
                    for(var j=0;j<fig.childElementCount;j++){
                        if(j==i) continue;
                        if(fig.childNodes[i].regionIndex==fig.childNodes[j].regionIndex){
                            fig.childNodes[j].classList.add('selected');
                        }
                    }
                }
            }
        },100);
        if(fig.selection&&fig.selection.node) fig.selection.node.remove();
        delete fig.selection;
    });

    fig.parentNode.onmousemove=function(e){
        if(!fig.transform.origin) return;
        var transform=fig.transform;
        transform.translate[0]=fig.transform.origin[0]+(e.x-fig.transform.event[0])*Math.sqrt(transform.scale);
        transform.translate[1]=fig.transform.origin[1]+(e.y-fig.transform.event[1])*Math.sqrt(transform.scale);
        fig.updateTransform();
        window.transformed=true;
    }
    fig.parentNode.onmouseup=function(){
        setTimeout(function(){
            if(window.transformed){
                delete window.transformed;
            }
        },100);
        delete fig.transform.event;
        delete fig.transform.origin;
    }
    fig.parentNode.onmouseleave=function(){
        if(window.transformed){
            delete window.transformed;
        }
        delete fig.transform.event;
        delete fig.transform.origin;
    }
    document.oncontextmenu=function(){
        return false;
    }
    document.onkeydown=function(e){
        if(e.keyCode==13){
            var model=document.querySelector('#model');
            if(model.classList.contains('editing-region')){
                regionConfirm();
            }
            else if(model.classList.contains('editing-material')){
                materialConfirm();
            }
            else if(model.classList.contains('editing-move')){
                moveConfirm();
            }
            var focus=document.querySelector('input:focus');
            if(focus){
                focus.blur();
            }
        }
        else if(e.keyCode==27){
            var model=document.querySelector('#model');
            if(model.classList.contains('editing-region')){
                regionCancel();
            }
            else if(model.classList.contains('editing-material')){
                materialCancel();
            }
            else if(model.classList.contains('editing-move')){
                moveCancel();
            }
        }
    }
}
