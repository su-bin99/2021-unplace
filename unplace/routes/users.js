
const   fs = require('fs');
const   express = require('express');
const   ejs = require('ejs');
const   mysql = require('mysql');
const   bodyParser = require('body-parser');
const   session = require('express-session');
const   router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

const crypto = require('crypto');
const algorithm = 'des-ecb';
const key = Buffer.from("d0e276d0144890d3","hex");

const   db = mysql.createConnection({
    host: 'localhost',        // DB서버 IP주소
    port: 3306,               // DB서버 Port주소
    user: 'bmlee',            // DB접속 아이디
    password: 'bmlee654321',  // DB암호
    database: 'bridge'         //사용할 DB명
});

//  -----------------------------------  회원가입기능 -----------------------------------------
// 회원가입 입력양식을 브라우져로 출력합니다.
const PrintRegistrationForm = (req, res) => {
  let    htmlstream = '';

       htmlstream = fs.readFileSync(__dirname + '/../views/header.ejs','utf8');
       htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/navbar.ejs','utf8');
       htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/reg_form.ejs','utf8');
       htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/footer.ejs','utf8');
       res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});

       if (req.session.auth) {  // true :로그인된 상태,  false : 로그인안된 상태
           res.end(ejs.render(htmlstream,  { 'title' : '쇼핑몰site',
                                             'logurl': '/users/logout',
                                             'loglabel': '로그아웃',
                                             'regurl': '/users/profile',
                                             'reglabel':req.session.who }));
       }
       else {
          res.end(ejs.render(htmlstream, { 'title' : '쇼핑몰site',
                                          'logurl': '/users/auth',
                                          'loglabel': '로그인',
                                          'regurl': '/users/reg',
                                          'reglabel':'가입' }));
       }

};

// 회원가입 양식에서 입력된 회원정보를 신규등록(DB에 저장)합니다.
const HandleRegistration = (req, res) => {  // 회원가입
let body = req.body;
let htmlstream='';
var cipher = crypto.createCipheriv(algorithm,key,null);
let encrypted = cipher.update(body.pw1,'utf8','hex');
encrypted += cipher.final('hex');

var cipher = crypto.createCipheriv(algorithm,key,null);
let encrypted2 = cipher.update(body.phone,'utf8','hex');
encrypted2 += cipher.final('hex');

    // 임시로 확인하기 위해 콘솔에 출력해봅니다.
    console.log('회원가입 입력정보 :%s, %s, %s, %s',body.uid, body.pw1, body.uname,body.phone);
    console.log('비밀번호 암호화 정보',encrypted);
    console.log('전화번호 암호화 정보',encrypted);
    if (body.uid == '' || body.pw1 == '' || body.phone == ''|| body.uname == '') {
         console.log("데이터입력이 되지 않아 DB에 저장할 수 없습니다.");
         res.status(561).end('<meta charset="utf-8">데이터가 입력되지 않아 가입을 할 수 없습니다');
    }
    else {
       db.query('INSERT INTO u07_users (uid, pass, name, phone, point) VALUES (?, ?, ?, ?, 10000000)', [body.uid, encrypted, body.uname,encrypted2], (error, results, fields) => {
          if (error) {
            htmlstream = fs.readFileSync(__dirname + '/../views/alert.ejs','utf8');
            res.status(562).end(ejs.render(htmlstream, { 'title': '알리미',
                               'warn_title':'회원가입 오류',
                               'warn_message':'이미 회원으로 등록되어 있습니다. 바로 로그인을 하시기 바랍니다.',
                               'return_url':'/' }));
          } else {
           console.log("회원가입에 성공하였으며, DB에 신규회원으로 등록하였습니다.!");
           res.redirect('/');
          }
       });

    }
};

// REST API의 URI와 핸들러를 매핑합니다.
router.get('/reg', PrintRegistrationForm);   // 회원가입화면을 출력처리
router.post('/reg', HandleRegistration);   // 회원가입내용을 DB에 등록처리
router.get('/', function(req, res) { res.send('respond with a resource 111'); });

// ------------------------------------  로그인기능 --------------------------------------

// 로그인 화면을 웹브라우져로 출력합니다.
const PrintLoginForm = (req, res) => {
  let    htmlstream = '';

       htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/topbar.ejs','utf8');
       htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/login.ejs','utf8');
       res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});

       if (req.session.auth) {  // true :로그인된 상태,  false : 로그인안된 상태
           res.end(ejs.render(htmlstream,  { 'title' : '쇼핑몰site',
                                             'logurl': '/users/logout',
                                             'loglabel': '로그아웃',
                                             'regurl': '/users/profile',
                                             'reglabel': req.session.who }));
       }
       else {
          res.end(ejs.render(htmlstream, { 'title' : '쇼핑몰site',
                                          'logurl': '/users/auth',
                                          'loglabel': '로그인',
                                          'regurl': '/users/reg',
                                          'reglabel':'가입' }));
       }

};

// 로그인을 수행합니다. (사용자인증처리)
const HandleLogin = (req, res) => {
  let body = req.body;
  let userid, userpass, username, userphone;
  let sql_str;
  let htmlstream = '';

      console.log('로그인 입력정보: %s, %s', body.uid, body.pass);
      if (body.uid == '' || body.pass == '') {
         console.log("아이디나 암호가 입력되지 않아서 로그인할 수 없습니다.");
         res.status(562).end('<meta charset="utf-8">아이디나 암호가 입력되지 않아서 로그인할 수 없습니다.');
      }
      else {
        var cipher = crypto.createCipheriv(algorithm,key,null);
        let encrypted = cipher.update(body.pass,'utf8','hex');
        encrypted += cipher.final('hex');
        console.log(body.pass,"이거 맞냐?");
       sql_str = "SELECT uid, pass, name from u07_users where uid ='"+ body.uid +"' and pass='" + encrypted + "';";
       db.query(sql_str, (error, results, fields) => {
         if (error) { res.status(562).end("Login Fail as No id in DB!"); }
         else {
            if (results.length <= 0) {  // select 조회결과가 없는 경우 (즉, 등록계정이 없는 경우)
                  htmlstream = fs.readFileSync(__dirname + '/../views/alert.ejs','utf8');
                  res.status(562).end(ejs.render(htmlstream, { 'title': '알리미',
                                     'warn_title':'로그인 오류',
                                     'warn_message':'등록된 계정이나 암호가 틀립니다.',
                                     'return_url':'/' }));
             } else {  // select 조회결과가 있는 경우 (즉, 등록사용자인 경우)
               results.forEach((item, index) => {
                  userid = item.uid;

                  var decipher = crypto.createDecipheriv(algorithm,key,null);
                  let decrypted = decipher.update(encrypted,'hex','utf8');
                  decrypted += decipher.final('utf8');


                  userpass = decrypted;
                  username = item.name;
                  userphone = item.phone;
                  userpoint = item.point;
                  console.log("DB에서 로그인성공한 ID/암호:%s/%s", userid, userpass);
                  console.log('암호화 입력정보: %s',encrypted);
                  console.log('해독 입력정보: %s',decrypted);
                  if (body.uid == userid && body.pass == userpass) {
                    req.session.auth = 99;      // 임의로 수(99)로 로그인성공했다는 것을 설정함
                    req.session.who = username; // 인증된 사용자명 확보 (로그인후 이름출력용)
                    req.session.uid = userid;
                    req.session.pass = userpass;
                    req.session.name = username;
                    req.session.phone = userphone;
                    req.session.point = userpoint;


                     if (body.uid == 'admin')    // 만약, 인증된 사용자가 관리자(admin)라면 이를 표시
                          req.session.admin = true;
                     res.redirect('/');
                  }
                }); /* foreach */
              } // else
            }  // else
       });
   }
}


// REST API의 URI와 핸들러를 매핑합니다.
//  URI: http://xxxx/users/auth
router.get('/auth', PrintLoginForm);   // 로그인 입력화면을 출력
router.post('/auth', HandleLogin);     // 로그인 정보로 인증처리

// ------------------------------  로그아웃기능 --------------------------------------

const HandleLogout = (req, res) => {
       req.session.destroy();     // 세션을 제거하여 인증오작동 문제를 해결
       res.redirect('/');         // 로그아웃후 메인화면으로 재접속
}

// REST API의 URI와 핸들러를 매핑합니다.
router.get('/logout', HandleLogout);       // 로그아웃 기능


// --------------- 정보변경 기능을 개발합니다 --------------------
const PrintProfile = (req, res) => {
  let  htmlstream = '';
       htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/navbar.ejs','utf8');
       htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/profile.ejs','utf8');
       htmlstream = htmlstream + fs.readFileSync(__dirname + '/../views/footer.ejs','utf8');  // Footer
       res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});
       res.status(562).end(ejs.render(htmlstream, { 'title': '정보 변경',
                           'name':req.session.who,
                           'uid':req.session.uid,
                           'uname':req.session.uname,
                           'pass': req.session.pass,
                           'phone':req.session.phone,
 }));
}

router.get('/profile', PrintProfile);     // 정보변경화면을 출력

// 회원정보를 수정하여 DB에 저장합니다.
const HandleUpdateProfile = (req, res) => {  // 회원 정보 수정
let body = req.body;
let htmlstream = '';

    // 콘솔에 변경 사항 출력합니다.
    console.log("---- 회원수정 실행 ----")
    console.log("수정 후 회원 비밀번호 : " + body.pw1);
    console.log("수정 후 회원 연락처 : " + body.uphone);

    if (body.pw1 == '') {
        htmlstream = fs.readFileSync(__dirname + '/../views/alert.ejs','utf8');
        res.status(561).end(ejs.render(htmlstream, { 'title': '알리미',
                           'warn_title':'오류',
                           'warn_message':'비밀번호는 필수로 입력해주세요.',
                           'return_url':'/' }));
    }
    else {
       var cipher = crypto.createCipheriv(algorithm,key,null);
       let encrypted = cipher.update(body.pw1,'utf8','hex');
       encrypted += cipher.final('hex');

       var cipher = crypto.createCipheriv(algorithm,key,null);
       let encrypted2 = cipher.update(body.uphone,'utf8','hex');
       encrypted2 += cipher.final('hex');


       db.query('UPDATE u07_users SET pass = ?, phone = ?',
       [encrypted, encrypted2], (error, results, fields) => {
          if (error) {
            htmlstream = fs.readFileSync(__dirname + '/../views/alert.ejs','utf8');
            res.status(562).end(ejs.render(htmlstream, { 'title': '알리미',
                               'warn_title':'오류',
                               'warn_message':'다시 수정해주세요.',
                               'return_url':'/' }));
          } else {
           console.log("암호화 결과 : %s",encrypted);
            console.log("폰 암호화 결과 : %s",encrypted2);
           console.log("---- 회원수정 완료. ----");
           res.redirect('/');
          }
       });

    }
};

// REST API의 URI와 핸들러를 매핑합니다.
router.post('/update_profile', HandleUpdateProfile);
module.exports = router;
