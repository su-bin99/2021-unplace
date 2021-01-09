// 메인화면 출력파일
const  express = require('express');
const  ejs = require('ejs');
const  fs = require('fs');
const  router = express.Router();
var    loglevel = 1;

const  GetMainUI = (req, res) => {   // 메인화면을 출력합니다
let    htmlstream = '';

     logging(loglevel, '  GetMainUI() 호출 ! ');
     res.render('firstpage');
      
      // { 'title' : '쇼핑몰site',
      // 'logurl': '/users/logout',
      // 'loglabel': '로그아웃',
      // 'regurl': '/users/profile',
      // 'reglabel':req.session.who,  // 세션에 저장된 사용자명표시
      // 'buyurl':'/users/buyprod',
      // 'buylabel' : '구매할래?'});


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
