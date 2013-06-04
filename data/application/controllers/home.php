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

        $users = DB::table('user')
            ->where('tel',  $tel)
            ->orWhere('email', $email)
            ->get();
        print_r($users);

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
        $record = GameRecord::order_by('time', 'asc')->take(20)->get();
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

}