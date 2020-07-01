var fs = require('fs'),
path = require('path'),
_ = require('underscore');
var csv = require("fast-csv");

//          (_    ,_,    _) 
//          / `'--) (--'` \
//         /  _,-'\_/'-,_  \
//        /.-'     "     '-.\
//         Julia Orion Smith

exports.liveMenu={};
exports.cache=false;
exports.currentMenu="mainmenu"//getMostRecentFileName("menu/archivo").replace(".csv","");
console.log("currentMenu:",this.currentMenu);
exports.inicializa=function (){
	isCached=getMostRecentFileName("menu/workingcopy");
	if(isCached!="menu.json"){
		console.log("no cache")
	}
	else{
		console.log(isCached)
		fs.readFile('menu/workingcopy/'+isCached, 'utf8', (err, jsonString) => {
		    if (err) {
		        console.log("Error reading file from disk:", err)
		        return
		    }
		    try {
		        this.liveMenu=JSON.parse(jsonString);
		        this.cache=true;
		        //console.log(this.liveMenu);
		} catch(err) {
		        console.log('Error parsing JSON string:', err)
		    }
		})
		

	}
	

}
exports.updateCache=function (cache){
	const jsonString = JSON.stringify(cache);
	fs.writeFile('menu/workingcopy/menu.json', jsonString, err => {
	    if (err) {
	        console.log('Error: writing file failed', err)
	    } else {
	        console.log('Successfully wrote cache')
	    }
	})
}
exports.menu=function (callback){
	menu={};
	IN_file="menu/"+this.currentMenu+".csv";
	rownum=0;
	proovedor="";
	csv
	 .parseFile(IN_file,{ delimiter:','})
	 .on("data", function(data){
	 	rownum+=1;
	 	data.push(rownum);

	 	if(rownum==1){}
	 	else{
	 		proovedor=data[5];
	 		
	 		
	 		if(!menu[proovedor]){
	 			menu[proovedor]=[];
	 		}
	 		menu[proovedor].push(data);
	 	}
	 		 	
	 })	
	 .on("end", function(){
	 	this.liveMenu=menu;
	 	//console.log(this.liveMenu)
	 	callback(this.liveMenu);
	 })
}
exports.actualiza=function (orden,callback){

	//console.log(this.liveMenu); //[key][1]=cantidad, [key][2]=precio, key0=names
	for(key in orden){
		nom=orden[key][0];

		productoProductor=nom.split("[|]");
		productor_list=[];
		discounted=0;

		if( Number.parseFloat( orden[key][1] ) > 0 ){

			//console.log(productoProductor,orden[key][1])
			//productor_list=this.liveMenu[ 'EL RENACER DEL CAMPO ( @elrenacerdelcampo)' ]
			productor_list=this.liveMenu[ productoProductor[1] ]


			for(i=0;i<productor_list.length;i++){
				if(productoProductor[0]==productor_list[i][0]){
					//ACTUALIZA INVENTARIO EN LIVE MENU
					//console.log("Before",this.liveMenu[ productoProductor[1] ]);
					discounted=Number.parseFloat(this.liveMenu[ productoProductor[1] ][ i ][3])-
					Number.parseFloat(orden[key][1]);
					this.liveMenu[ productoProductor[1] ][ i ][3]=discounted;
					//console.log("After",this.liveMenu[ productoProductor[1] ][ i ][3]);

				}
			}
			
		}
		
	}
	callback();
}



exports.getOrden= function(orden,callback){
	if (fs.existsSync('ordenes/'+orden+".json")) {
    	orden = JSON.parse(fs.readFileSync('ordenes/'+orden+".json", 'utf8'));
		callback(orden);
  	}
  	else{
  		callback({});
  	}
	
}
exports.ordenaOrdenes= function(callback){

	fs.readdir("ordenes", function (err, files) {
	 admin={};
	 header="";
	 csv="";
	  if (err) {
        console.error("Error stating file.", error);
        return;
      }
      files.forEach(function (file, index) {
      	
      	if(!file.includes(".DS")){

      		admin[file] = JSON.parse(fs.readFileSync('ordenes/'+file, 'utf8'));
      		if (header==""){
      			header=getHeader(admin[file])+"<Br>";
      			//csv+=header;
      		}
      		//fs.readFile("ordenes/"+file, handleFile);
      		csv+=printOrder(file,admin[file])+"<Br>";
      	}
      	
      	//console.log(file,index);
      });
      callback(csv)
	});

	
}
exports.getOrdenes= function(callback){
	
	fs.readdir("ordenes", function (err, files) {
	 admin={};
	 header="";
	 csv="";
	  if (err) {
        console.error("Error stating file.", error);
        return;
      }
      files.forEach(function (file, index) {
      	
      	if(!file.includes(".DS")){

      		admin[file] = JSON.parse(fs.readFileSync('ordenes/'+file, 'utf8'));
      		if (header==""){
      			header=getHeader(admin[file])+"<Br>";
      			csv+=header;
      		}
      		//fs.readFile("ordenes/"+file, handleFile);
      		csv+=handleOrder(file,admin[file])+"<Br>";
      	}
      	
      	//console.log(file,index);
      });
      callback(csv)
	});
}
exports.getOrdenesJson= function(callback){
	orderdir="./ordenes";
	if (!fs.existsSync(orderdir)){
	   callback({})
	}
	else{
		fs.readdir("./ordenes", function (err, files) {
		 admin={};
		 header="";
		 csv="";
		  if (err) {
	        console.error("Error stating file.", error);
	        return;
	      }
	      files.forEach(function (file, index) {
	      	
	      	if(!file.includes(".DS")){

	      		admin[file] = JSON.parse(fs.readFileSync('ordenes/'+file, 'utf8'));
	      		if (header==""){
	      			header=getHeader(admin[file])+"<Br>";
	      			csv+=header;
	      		}
	      		csv+=handleOrder(file,admin[file])+"<Br>";
	      	}
	      	
	      });
	      	bandeja={};
	      	fs.readdir("./bandeja", function (err, files) {
	      		bandeja={};
	      		files.forEach(function (file) {
	      			bandeja[file.replace(".pdf","")]=1;
			    });
	    		callback({"ordenes":admin,"bandeja":bandeja})
			});
	      
		});
	}
	
}
exports.closeShop=function (callback) {  //CERRAR TIENDA
	mainmenuDir="./menu/mainmenu.csv";
	cacheDir="./menu/workingcopy/menu.json";
	//TIMESTAMP en segundos
	archivoDir="./archivo/mainmenu_"+Math.floor(Date.now() / 1000);
    fs.rename(mainmenuDir, archivoDir, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        fs.unlink(cacheDir, callback);
        
        
    });

    function copy() { 		
        var readStream = fs.createReadStream(ordenesDir);
        var writeStream = fs.createWriteStream(archivoDir);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(ordenesDir, callback);
        });

        readStream.pipe(writeStream);
    }
}
exports.closeOp=function (callback) {	//CERRAR OPERACIÓN
	ordenesDir="./ordenes";
	//TIMESTAMP en segundos
	archivoDir="./archivo/ordenes_"+Math.floor(Date.now() / 1000);
    fs.rename(ordenesDir, archivoDir, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        else{
        	//fs.unlink("./menu/workingcopy/menu.json", callback);

        }
        callback();
        
    });

    function copy() {
        var readStream = fs.createReadStream(ordenesDir);
        var writeStream = fs.createWriteStream(archivoDir);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(ordenesDir, callback);
        });

        readStream.pipe(writeStream);
    }
}

exports.uploadmenu= function(newmenu,callback){
	fs.unlink("./menu/workingcopy/menu.json", function (err) {
			    
	});

	fs.writeFile('./menu/mainmenu.csv', newmenu, function (err) {
	  if (err){
	  	callback({"status":"err","err":err})
	  } 
	  else{
	  	fs.mkdir("./ordenes", (err) => { 

	  		

		    if (err) { 
		         callback({"status":"err","err":err})
		    } 
		    else{
		    	
		    	callback({"status":"suave"})}
		}); 

	  }
	});
}


function getHeader(singularOrder){
	respuesta="Archivo;nombre;total;telefono;direccion;comentarios;costo_envio;;";
	for(key in singularOrder["orden"]){
		//productArray=singularOrder["orden"][key];
		mm=singularOrder["orden"][key][0].replace(";","");
		respuesta+=mm+";";
	}
	return respuesta;
}
function handleOrder(file,singularOrder){
	respuesta=
	file+";"+
	singularOrder["nombre"]+";"+
	singularOrder["total"]+";"+
	singularOrder["telefono"]+";"+
	singularOrder["dicreccion"]+";"+
	singularOrder["comentarios"]+";"+
	singularOrder["costo_envio"]+";;";
	for(key in singularOrder["orden"]){

		productArray=singularOrder["orden"][key];
		
		respuesta+=singularOrder["orden"][key][1]+";";
	}
	//respuesta+="\n";
	return respuesta;
}
function printOrder(file,singularOrder){
	respuesta=
	"<hr>"+file+";"+
		singularOrder["nombre"]+"<Br>"+
	singularOrder["total"]+"<Br>"+
	singularOrder["telefono"]+"<Br>"+
	singularOrder["dicreccion"]+"<Br>"+
	singularOrder["comentarios"]+"<Br>"+
	singularOrder["costo_envio"]+"<Br>";
	for(key in singularOrder["orden"]){
		productArray=singularOrder["orden"][key];
		if(productArray[1]!=0){
			console.log(productArray);
			respuesta+=productArray+"<Br>";
		}
		
	}
	//respuesta+="\n";
	return respuesta;
}
// Write the callback function
function handleFile(err, data) {
    if (err) throw err
    obj = JSON.parse(data)
	console.log(obj)
    // You can now play with your datas
}

function getMostRecentFileName(dir) {
    var files = fs.readdirSync(dir);

    // use underscore for max()
    return _.max(files, function (f) {
        var fullpath = path.join(dir, f);

        // ctime = creation time is used
        // replace with mtime for modification time
        return fs.statSync(fullpath).mtime;
    });
}

