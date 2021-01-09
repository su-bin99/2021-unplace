// 메인화면 출력파일
const  express = require('express');
const  ejs = require('ejs');
const  fs = require('fs');
const  router = express.Router();
var    loglevel = 1;

const   db = mysql.createConnection({
      host: '49.50.165.106',        // DB서버 IP주소
      port: 65007,               // DB서버 Port주소
      user: 'root',            // DB접속 아이디
      password: 'lees9814!@',  // DB암호
      database: 'unplace'         //사용할 DB명
  });
  
const  GetMainUI = (req, res) => {   // 메인화면을 출력합니다
let    htmlstream = '';

     logging(loglevel, '  GetMainUI() 호출 ! ');
     res.render('login');
      


};

const logging = (level, logmsg) => {
       if (level != 0) {
         console.log(level, logmsg)
         loglevel++;
      }
}

// ‘/’ get 메소드의 핸들러를 정의
router.get('/', GetMainUI);

// 외부로 뺍니다.
module.exports = router
