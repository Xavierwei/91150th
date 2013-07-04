<?php

class Home_Controller extends Base_Controller {

	/*
	|--------------------------------------------------------------------------
	| The Default Controller
	|--------------------------------------------------------------------------
	|
	| Instead of using RESTful routes and anonymous functions, you might wish
	| to use controllers to organize your application API. You'll love them.
	|
	| This controller responds to URIs beginning with "home", and it also
	| serves as the default controller for the application, meaning it
	| handles requests to the root of the application.
	|
	| You can respond to GET requests to "/home/profile" like so:
	|
	|		public function action_profile()
	|		{
	|			return "This is your profile!";
	|		}
	|
	| Any extra segments are passed to the method as parameters:
	|
	|		public function action_profile($id)
	|		{
	|			return "This is the profile for user {$id}.";
	|		}
	|
	*/

	public function action_index()
	{	
		$user = $this->_get_user();
		return View::make('home.index')->with("user", $user);
	}

	public function action_weibo() {
		$user = $this->_get_user();
		// Logined ? redirect to home.
		if ($user) {
			return Redirect::to("home/index");
		}
		$auth_url = Weibo::getAuthURL();
		return View::make("home.weibo")->with("code_url", $auth_url);
	}

    public function action_checkuser() {
        $user = $this->_get_user();
        // Logined ? redirect to home.
        if (!$user) {
            return Response::json(array("error" => "nologin", "code" => 500, "data" => array()));
        }
        return Response::json(array("data" => $user, "code" => 200, "error" => ""));
    }

    public function action_logout() {
        SESSION::forget('user');
    }

	public function action_register() {
		if (!Input::has("name") || !Input::has("email")) {
			return Response::json(array("error" => "argument missed", "code" => 500, "data" => array()));
		}
        $name = Input::get("name");
        $email = Input::get("email");
        $tel = Input::get("tel");
        $code = Input::get("code");
        $address = Input::get("address");
        $authcode = Input::get("authcode");

        if($authcode != SESSION::get("authcode"))
        {
            return Response::json(array("error" => "auth code failed", "code" => 501, "data" => array()));
        }

//        $users = DB::table('user')
//            ->where('tel', '=', $tel)
//            ->or_where('email','=', $email)
//            ->or_where('address','=', $address)
//            ->get();
//        if(count($users) > 0)
//        {
//            return Response::json(array("error" => "exist", "code" => 500, "data" => array()));
//        }

        $tmpuser = array(
            "name" => $name,
            "email" => $email,
            "tel" => $tel,
            "code" => $code,
            "address" => $address
        );

		$user = User::create($tmpuser);
        $this->_put_user($user);
		if (!$user) {
			return Response::json(array("error" => "register failed", "code" => 500, "data" => array()));
		}
		return Response::json(array("data" => $user, "code" => 200, "error" => ""));
	}

    public function action_getrecord() {

        $month = Input::get("m");
        $record = DB::table('game_record')
            ->join('user', 'user.uid', '=', 'game_record.uid')
            ->where(\DB::raw("DATE_FORMAT(game_record.created_at, '%c')"),'=',$month)
            ->order_by('game_record.time', 'desc')->take(20)->get();

        return Response::json(array("data" => $record, "code" => 200, "error" => ""));
    }

	public function action_record() {
		if (!Input::get("time") || !Input::get("distance")) {
			return Response::json(array("error" => "argument missed", "code" => 500, "data" => array()));
		}
		$tmprecord = array(
			"time" => Input::get("time"),
			"distance" => Input::get("distance"),
            "status" => Input::get("status"),
			"weibo_uid" => Input::get("weibo_uid"),
			"name" => Input::get("name"),
            "uid" => Input::get("uid"),
		);
		$record = GameRecord::create($tmprecord);
		return Response::json(array("data" => $record, "code" => 200, "error" => ""));
	}

	public function action_callback() {
        try{
            $auth_token = Weibo::authCallback();
            $user = $this->_request_user();
            if (!$user) {
                return View::make("home.error")->with("error", "get weibo user failed");
            }
            $this->_put_user($user);

            return Redirect::to("../../../index.html");
        }
        catch(Exception $e)
        {}
	}

	private function _put_user($user) {
		SESSION::put("user", serialize($user));
	}

	private function _get_user() {
		$user = SESSION::get("user");
		return unserialize($user);
	}

	private function _request_user() {
		$weibo = Weibo::weiboClient();
		$ret = $weibo->get_uid();
		$user_message = $weibo->show_user_by_id($ret["uid"]);
		$user = User::where_weibo_uid($ret["uid"])->first();
		// Empty ? we create new one
		if (!$user) {
			$tmpuser = array(
				"weibo_uid" => $ret["uid"],
				"token" => SESSION::get("weibo_token"),
				"weibo_name" => $user_message["name"],
				"email" => "",
				"name" => $user_message["name"],
			);
			$user = User::create($tmpuser);
			if (!$user) {
				return NULL;
			}
		}
		return $user;
	}

	public function action_weibotest() {
		print_r("hello");
	}

    public function action_authcode() {
//随机生成一个4位数的数字验证码
        $num="";
        for($i=0;$i<4;$i++){
            $num .= rand(0,9);
        }
//4位验证码也可以用rand(1000,9999)直接生成
//将生成的验证码写入session，备验证页面使用
        SESSION::put("authcode", $num);
//创建图片，定义颜色值
        Header("Content-type: image/PNG");
        srand((double)microtime()*1000000);
        $im = imagecreate(60,20);
        $black = ImageColorAllocate($im, 255,255,255);
        $gray = ImageColorAllocate($im, 0,0,0);
        $gray2 = ImageColorAllocate($im, 100,100,100);
        imagefill($im,0,0,$gray);

//随机绘制两条虚线，起干扰作用
        $style = array($gray2, $gray2, $gray2, $gray2, $gray2, $gray, $gray, $gray, $gray, $gray);
        imagesetstyle($im, $style);
        $y1=rand(0,20);
        $y2=rand(0,20);
        $y3=rand(0,20);
        $y4=rand(0,20);
        imageline($im, 0, $y1, 60, $y3, IMG_COLOR_STYLED);
        imageline($im, 0, $y2, 60, $y4, IMG_COLOR_STYLED);

//在画布上随机生成大量黑点，起干扰作用;
        for($i=0;$i<80;$i++)
        {
            imagesetpixel($im, rand(0,60), rand(0,20), $gray2);
        }
//将四个数字随机显示在画布上,字符的水平间距和位置都按一定波动范围随机生成
        $strx=rand(3,8);
        for($i=0;$i<4;$i++){
            $strpos=rand(1,6);
            imagestring($im,5,$strx,$strpos, substr($num,$i,1), $black);
            $strx+=rand(8,12);
        }
        ImagePNG($im);
        ImageDestroy($im);
    }
}