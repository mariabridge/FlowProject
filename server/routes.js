const path = require("path");
const mysql = require('mysql');
var Sequelize = require('sequelize');

var sequelize = new Sequelize('flowproj', 'flowproj', 'Y7zS6ELp8rvGttdbfTK0dGEa8VmEub', {

	host:'http://e000-uat-web.cxyt74qbttnp.eu-west-1.rds.amazonaws.com',
    port:'3306',
	dialect: 'mysql'
	
});

/*
*	Define Models
*/
var User = sequelize.define('FL_users', {
	u_firstname: Sequelize.STRING,
	u_surname: Sequelize.STRING,
	u_email: Sequelize.STRING,
	u_business: Sequelize.STRING,
	u_roll: Sequelize.STRING,
	u_pass: Sequelize.STRING,
});

var Integration = sequelize.define('FL_integrations', {
	int_cell_id: Sequelize.INTEGER,
	project_id: Sequelize.INTEGER,
	int_name: Sequelize.STRING,
	int_desc: Sequelize.STRING,
	int_posX: Sequelize.DOUBLE,
	int_posY: Sequelize.DOUBLE,
	int_width: Sequelize.DOUBLE,
	int_height: Sequelize.DOUBLE,
	int_style: Sequelize.STRING,
	int_endpoints: Sequelize.STRING,
});

var Projects = sequelize.define('FL_projects', {
	project_name: Sequelize.STRING,
	user_id: Sequelize.INTEGER,
});

var System = sequelize.define('FL_systems', {
	sys_cell_id: Sequelize.INTEGER,
	integration_id: Sequelize.INTEGER,
	sys_name: Sequelize.STRING,
	sys_posX: Sequelize.DOUBLE,
	sys_posY: Sequelize.DOUBLE,
	sys_width: Sequelize.DOUBLE,
	sys_height: Sequelize.DOUBLE,
	sys_style: Sequelize.STRING,
	sys_endpoints: Sequelize.STRING,
	sys_type: Sequelize.STRING,
});


var Microflow = sequelize.define('FL_microflows', {
	mf_cell_id: Sequelize.INTEGER,
	integration_id: Sequelize.INTEGER,
	mf_name: Sequelize.STRING,
	mf_posX: Sequelize.DOUBLE,
	mf_posY: Sequelize.DOUBLE,
	mf_width: Sequelize.DOUBLE,
	mf_height: Sequelize.DOUBLE,
	mf_style: Sequelize.STRING,
	mf_endpoints: Sequelize.STRING,
	mf_type: Sequelize.STRING,
});

var Connectors = sequelize.define('FL_connectors', {
	con_cell_id: Sequelize.INTEGER,
	integration_id: Sequelize.INTEGER,
	con_name: Sequelize.STRING,
	con_source: Sequelize.INTEGER,
	con_target: Sequelize.INTEGER,
	con_type: Sequelize.STRING,
});

var  Nodes = sequelize.define('FL_nodes', {
	cell_id: Sequelize.INTEGER,
	integration_id: Sequelize.INTEGER,
	name: Sequelize.STRING,
	posX: Sequelize.DOUBLE,
	posY: Sequelize.DOUBLE,
	width: Sequelize.DOUBLE,
	height: Sequelize.DOUBLE,
	style: Sequelize.STRING,
	endpoints: Sequelize.STRING,
	source: Sequelize.INTEGER,
	target: Sequelize.INTEGER,
	type: Sequelize.STRING,
});

var success = 0;
  
var MD5 = function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]| (G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()};

const con = mysql.createConnection({
	host: "e000-uat-web.cxyt74qbttnp.eu-west-1.rds.amazonaws.com",
	user: "flowproj",
	password: "Y7zS6ELp8rvGttdbfTK0dGEa8VmEub",
	database: "flowproj"
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
});

module.exports = function(app, passport) {
	//const distPath = path.join(__dirname, "../dist");
	//const indexFileName = "index.html";

	const distPath = path.join(__dirname, "../src");
	const indexFileName = "index-template.html";


	// =========================================================================
	// FACEBOOK ================================================================
	// =========================================================================
	app.get("/auth/facebook",
	  passport.authenticate("facebook"));

	app.get("/auth/facebook/callback", 
	  passport.authenticate("facebook", { failureRedirect: "/sign-in", failureFlash: true }),
	  function(req, res) {
	    res.redirect("/");
		}
	);

	// =========================================================================
	// GOOGLE ==================================================================
	// =========================================================================
	app.get("/auth/google",
		passport.authenticate("google", { scope: ["profile"] }));

	app.get("/auth/google/callback", 
		passport.authenticate("google", { failureRedirect: "/sign-in" }),
		function(req, res) {
			res.redirect("/");
		}
	);

	// =========================================================================
	// LinkedIn ================================================================
	// =========================================================================
	app.get("/auth/linkedin",
		passport.authenticate("linkedin"));
	
	app.get("/auth/linkedin/callback", passport.authenticate("linkedin", {
		successRedirect: "/",
		failureRedirect: "/",
	}));


	app.get("/auth/log-out", function(req, res) {
		req.logout();
		res.redirect("/");
	});

	app.get("/api/get/user", (req, res) => {
		//console.log(req);console.log(res);
		res.send(req.user);
	});


	// =========================================================================
	// REGISTRATION ================================================================
	// =========================================================================
	app.post('/api/post/registration', function (req, res) {
		
		var password_ = req.body.password;
		var password = (MD5(password_));

		sequelize.sync().then(function() {
			return User.create({
				u_firstname: req.body.firstname,
				u_surname: req.body.surname,
				u_email: req.body.mail,
				u_business: req.body.business,
				u_roll: req.body.roll,
				u_pass: password,
			});
		  }).then(function(jane) {
			  console.log("Success")
		  });
	});

	
	// =========================================================================
	// LOGIN ================================================================
	// =========================================================================
	app.post('/api/post/login', function (req, res) {

		var password_ = req.body.password;
		var password = (MD5(password_));

		var sql = "SELECT * FROM FL_users WHERE u_email = '"+req.body.email+"' AND u_pass = '"+password+"' ";
		con.query(sql, function (err, result) {
			if (err) {
				//throw err;
				res.send(err)
			}else{
				if(result[0]){
					req.result = result[0];
					passport.authenticate(
						'local-signup', { scope : 'email' }
					)(req,res,function(){
						res.redirect('/dashboard');
					});
				}else{
					res.send(result)
				}
			}
		});	
	});
	
	//=========================================================================
	// SAVE PROJECT ===========================================================
	//=========================================================================
	app.post('/api/post/project', function (req, res) {

		var flowObj = req.body.flowObj;

		var project_id = req.body.project_id;

		//res.send("success");

		//var project_saved = false;

		if(project_id && project_id !='undefined')
		{ 
			//Edit Project 
			sequelize.sync().then(function() {
				 return Projects.update(
						    req.body,
						    { where: { id: project_id }} /* where criteria */
						  );
			}).then(function(proj) {
				//project_saved = true;
				for(var i=0; i<flowObj.length; i++ ){

					var integration_id = flowObj[i].integration_id;

					if(flowObj[i].type == "Flow"){
						fillIntegration(flowObj[i], project_id, integration_id);
					}
				}

				if(success == req.body.totalNodes)
				{
					res.send("success");
				}

				
			});
		}
		else{ 
			//Create Project
			sequelize.sync().then(function() {
				return Projects.create(req.body);
			}).then(function(proj) {
				var project_id = proj.get({ plain: true }).id;
				//project_saved = true;

				for(var i=0; i<flowObj.length; i++ ){

					if(flowObj[i].type == "Flow"){
						fillIntegration(flowObj[i], project_id);
					}
				}
				console.log("success" +success+"-- toalndes "+ req.body.totalNodes);
				if(success == req.body.totalNodes)
				{
					res.send("success");
				}
				
			});
		}

				
	});


	function fillIntegration(flowObj, project_id, integration_id){

		var integration_saved = false;

		if(integration_id)
		{
			// Edit flow node
			sequelize.sync().then(function() {

				return Integration.update(
						    {
								int_cell_id: flowObj.cell_id,
								project_id: project_id,
								int_name: flowObj.title,
								int_desc: flowObj.desc,
								int_posX: flowObj.x,
								int_posY: flowObj.y,
								int_width: flowObj.width,
								int_height: flowObj.height,
								int_style: flowObj.style,
								int_endpoints: (flowObj.endPoints).join(),
							},
						    { where: { id: integration_id }} /* where criteria */
						  );
			}).then(function(integ) {
				success++;
				integration_saved = true;

				if(flowObj.childNodes.length >0)
				{
					getChild(flowObj.childNodes, integration_id);
				}
				if(flowObj.connectors.length >0)
				{
					getConnectors(flowObj.connectors, integration_id);
				}
				
			});
		}
		else{ // Add new flow node
			sequelize.sync().then(function() {
				return Integration.create({
					int_cell_id: flowObj.cell_id,
					project_id: project_id,
					int_name: flowObj.title,
					int_desc: flowObj.desc,
					int_posX: flowObj.x,
					int_posY: flowObj.y,
					int_width: flowObj.width,
					int_height: flowObj.height,
					int_style: flowObj.style,
					int_endpoints: (flowObj.endPoints).join(),
				});
			}).then(function(integ) {
				success++;
				
				integration_id = integ.get({ plain: true }).id;
				integration_saved = true;

				if(flowObj.childNodes.length >0)
				{
					getChild(flowObj.childNodes, integration_id);
				}
				if(flowObj.connectors.length >0)
				{
					getConnectors(flowObj.connectors, integration_id);
				}
				
			});
		}

		/*if(integration_saved)
		{
			if(flowObj.childNodes.length >0)
			{
				getChild(flowObj.childNodes, integration_id);
			}
			if(flowObj.connectors.length >0)
			{
				getConnectors(flowObj.connectors, integration_id);
			}
		}*/
	}

	function getChild(childNodes, integration_id){

		for( var j=0; j<childNodes.length; j++ ){
			if( childNodes[j].type == "Source" || childNodes[j].type == "Target" ){
				fillSystem(childNodes[j], integration_id, childNodes[j].id)
			}
			else if(childNodes[j].type == "Experience" || childNodes[j].type == "Process" || childNodes[j].type == "Information" ) {
				fillMicroflow(childNodes[j], integration_id, childNodes[j].id)
			}
		}
	}

	function getConnectors(connectors, integration_id){

		for( var k=0; k<connectors.length; k++ ){
			fillConnector(connectors[k], integration_id, connectors[k].id);
		}
	}
	

	function fillSystem(childNode, integration_id, elem_id){
		
		if(elem_id)
		{
			sequelize.sync().then(function() {
				
				return System.update(
				    {
						sys_cell_id: childNode.cell_id,
						integration_id: integration_id,
						sys_name: childNode.title,
						sys_posX: childNode.x,
						sys_posY: childNode.y,
						sys_width: childNode.width,
						sys_height: childNode.height,
						sys_style: childNode.style,
						sys_endpoints: (childNode.endPoints).join(),
						sys_type: childNode.type
					},
				    { where: { id: elem_id }} /* where criteria */
				);
			}).then(function(sys) {
				success++;
				console.log("System added Successfully");

			});
			
		}
		else
		{
			sequelize.sync().then(function() {
				return System.create({
					sys_cell_id: childNode.cell_id,
					integration_id: integration_id,
					sys_name: childNode.title,
					sys_posX: childNode.x,
					sys_posY: childNode.y,
					sys_width: childNode.width,
					sys_height: childNode.height,
					sys_style: childNode.style,
					sys_endpoints: (childNode.endPoints).join(),
					sys_type: childNode.type
				});
			}).then(function(sys) {
				success++;
				console.log("System added Successfully");

			});
		}
	}

	function fillMicroflow(childNode, integration_id, elem_id){
		if(elem_id)
		{
			sequelize.sync().then(function() {
				return Microflow.update(
				{
					mf_cell_id: childNode.cell_id,
					integration_id: integration_id,
					mf_name: childNode.title,
					mf_posX: childNode.x,
					mf_posY: childNode.y,
					mf_width: childNode.width,
					mf_height: childNode.height,
					mf_style: childNode.style,
					mf_endpoints: (childNode.endPoints).join(),
					mf_type: childNode.type
				},
				{ where: { id: elem_id }});
			}).then(function(mic) {
				success++;
				console.log("MicroFlow updated Successfully");
				
			});
		}
		else
		{
			sequelize.sync().then(function() {
				return Microflow.create({
					mf_cell_id: childNode.cell_id,
					integration_id: integration_id,
					mf_name: childNode.title,
					mf_posX: childNode.x,
					mf_posY: childNode.y,
					mf_width: childNode.width,
					mf_height: childNode.height,
					mf_style: childNode.style,
					mf_endpoints: (childNode.endPoints).join(),
					mf_type: childNode.type
				});
			}).then(function(mic) {
				success++;
				console.log("MicroFlow added Successfully");
				
			});
		}
	}

	function fillConnector(connector, integration_id, elem_id){
		if(elem_id)
		{
			sequelize.sync().then(function() {
				return Connectors.update(
				{
					con_cell_id: connector.cell_id,
					integration_id: integration_id,
					con_name: connector.title,
					con_source: connector.source,
					con_target: connector.target,
					con_type: connector.type
				},
				{ where: { id: elem_id }});
			}).then(function(connect) {
				success++;
				console.log("Connector updated Successfully");
			});
		}
		else
		{
			sequelize.sync().then(function() {
				return Connectors.create({
					con_cell_id: connector.cell_id,
					integration_id: integration_id,
					con_name: connector.title,
					con_source: connector.source,
					con_target: connector.target,
					con_type: connector.type
				});
			}).then(function(connect) {
				success++;
				console.log("Connector added Successfully");
			});
		}
	}

	

	
	// =========================================================================
	// GET PROJECTS ================================================================
	// =========================================================================
	app.get('/api/get/projects/:id', function (req, res) {

		var user_id = req.params.id;
		var sql = "SELECT P.*, count(I.id) as flow_count FROM FL_projects P JOIN FL_integrations I ON P.id = I.project_id WHERE P.user_id = '"+user_id+"'  GROUP BY I.project_id";
		con.query(sql, function (err, result) {
			if (err) {
				res.send(err)
			}else{
				res.send(result)
			}
		});
	});
	
	// =========================================================================
	// GET PROJECTS FLOWS ================================================================
	// =========================================================================
	app.get('/api/get/project/:id', function (req, res) {

		var flowData = {}, counter=0;
		var p_id = req.params.id;
		var sql = "SELECT *,'flow' as type FROM FL_integrations WHERE project_id = '"+p_id+"'";
		con.query(sql, function (err, result) {
			if (err) {
				res.send(err)
			}else{
				
				flowData.flow = result;
				flowData.childCells = [];

				for(var r=0; r<result.length; r++){
					
					var cell_id = result[r].id;
					var sql = "select * from ( (SELECT id, int_cell_id as cell_id, id as integration_id, int_name as name, int_posX as posX, int_posY as posY, int_width as width, int_height as height, int_style as style, 'flow' as type, int_endpoints as endpoints FROM FL_integrations WHERE id = '"+cell_id+"' ) UNION (SELECT id,mf_cell_id,integration_id,mf_name,mf_posX,mf_posY,mf_width,mf_height,mf_style,mf_type, mf_endpoints FROM FL_microflows WHERE integration_id = '"+cell_id+
					"' ) UNION (SELECT id, sys_cell_id,integration_id,sys_name,sys_posX,sys_posY,sys_width,sys_height,sys_style, sys_type, sys_endpoints FROM FL_systems WHERE integration_id = '"+cell_id+"' ) UNION (SELECT id, con_cell_id,integration_id,con_name,con_source, con_target, '0' as width, '0' as height, 'connector' as style, con_type, '0' as endpoints FROM FL_connectors WHERE integration_id = '"+cell_id+"' )) AS nodes ORDER BY cell_id ASC";
					con.query(sql, function (err, resdata) {
						if (err) {
							res.send(err);
						}else{
							
							flowData.flow[counter].childNodes = resdata;
						 	flowData.childCells = flowData.childCells.concat(resdata);


							if(counter == result.length - 1) {
								res.send( flowData )
							}
							counter++;
						}
					});
				}
			}
		});
	});		

	// =========================================================================
	// GET PROJECTS Name =======================================================
	// =========================================================================
	app.get('/api/get/project_name/:id', function (req, res) {

		var id = req.params.id;
		var sql = "SELECT project_name  FROM FL_projects WHERE id = '"+id+"'";
		con.query(sql, function (err, result) {
			if (err) {
				res.send(err)
			}else{
				
				res.send( result );
			}
		});
	});		

	app.get("/*", (req, res) => {
		res.sendFile(path.join(distPath, indexFileName));
   });
	
};

