var path = require("path");
var express = require('express');
var fs = require('fs');
var exec = require('child_process').exec;
var formidable = require('formidable');
var jwt = require("jsonwebtoken");
var uuid = require("uuid/v1");

var router;
router = express.Router(null);

function checkLogin(req, res, next) {
  if(req.session.secret){
    var secret = req.session.secret;
    var token = req.session.token;
    try {
      jwt.verify(token, secret);
    } catch (error) {
      console.error(error);
      next();
    }
    next();
  }else{
    secret = uuid();
    req.session.secret = secret;
    req.session.token = jwt.sign({ key: "secret" }, secret);
  }
}

/* GET home page. */
router.get('/', function(req, res) {
  if (typeof req.session.secret === "undefined") {
    var secret = uuid();
    req.session.secret = secret;
    req.session.token = jwt.sign({ key: "secret" }, secret);

    console.log(req.session.secret);

    res.removeHeader('Content-Type');
    res.render('index', { title: 'Express' });
  } else {
    res.removeHeader('Content-Type');
    res.render('index', { title: 'Express' });
  }
});

router.post("/run" ,checkLogin,function(req, res){
  var codePath = path.join(
      "__dirname",
      "..",
      "code"
  );
  console.log(req.session.secret);
  var secret = req.session.secret;
  res.contentType('json');
  if(req.body.lang === "C"){
    fs.open('test.c', 'w', function(err){
      if(err){
        console.log("Erreur de Lecture" + err);          
      }
      else{
        fs.writeFile('test.c', req.body.sourceCode, function(err){
          if(err){
            console.log(err);
          }
          exec("gcc test.c", function(error, stdout, stderr){
            if(error){
              console.error('Exec Error' + error);            
              return res.send({data: String(error), compilestatus: false, runstatus: false});
            }
            else{
              console.log(stdout);  
              console.log(stderr); 
              exec('./a.out', function(error, stdout, stderr){
                if(error){
                  console.error('Exec Error' + error);
                  console.error("Stderror", stderr);
                  return res.send({data: String(stdout), compilestatus: true, runstatus: false});
                }
                console.log(stdout);                                                      
                return res.send({data: String(stdout), compilestatus: true, runstatus: true});
              });   
            }           
          });   
        }); 
      }
    });
  }
  else{
    fs.open(codePath + '/main' + secret + '.txt', 'w', function(err){
      if(err){
        console.log("Erreur de Lecture" + err);          
      }
      else{
        fs.writeFile(codePath + '/main' + secret + '.txt', req.body.sourceCode, function(err){
          if(err){
            console.log(err);
          }
          exec("./" + codePath + '/algo_compiler' +" " + codePath+ '/main' + secret + '.txt', function(error, stdout){
            if(error){
              console.log("Exec Error" + error);
              return res.send({data: String(stdout), compilestatus: true, runstatus: false});
            }
            //console.log(stdout);
            fs.unlink(codePath + '/main' + secret + '.txt', function (err) {
              if (err) throw err;
              console.log('File deleted!');
              return res.send({data: String(stdout), compilestatus: true, runstatus: true})
            });
          });
        }); 
      }
    });
  }
});

router.post('/test',checkLogin, function(req, res){
  //console.log('body: ' + JSON.stringify(req.body));
  res.write(String(req.body));
});

router.post('/openfile', checkLogin,function(req, res){
  var form = new formidable.IncomingForm();
  form.multiples = true;

  form.on('file', function(field, file){
    fs.readFile(file.path, 'utf8', function(err, fileContents){
      if(err){
        console.log(err);
      }
      else{
        console.log(fileContents);
        res.send(fileContents);
      }      
    });
  });

  form.on('error', function(err){
    console.log('An error has occurred : \n' + err);
  });

  form.on('end', function(){
    console.log("success");
  });

  form.parse(req);
});

module.exports = router;
