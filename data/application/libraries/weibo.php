<?php
header('Content-Type: text/html; charset=UTF-8');

define( "WB_AKEY" , '1522524724' );
define( "WB_SKEY" , '3b53836d69058abca2435bf751867f80' );
define( "WB_CALLBACK_URL" , 'http://lightgame.local:81/home/callback' );

Class Weibo {
	static function getAuthURL() {
		include_once( 'saetv2.ex.class.php' );
		$o = new SaeTOAuthV2( WB_AKEY , WB_SKEY );
		$code_url = $o->getAuthorizeURL( WB_CALLBACK_URL );
		return $code_url;
	}

	static function authCallback() {
		include_once( 'saetv2.ex.class.php');

		$o = new SaeTOAuthV2( WB_AKEY , WB_SKEY );

		if (isset($_REQUEST['code'])) {
			$keys = array();
			$keys['code'] = $_REQUEST['code'];
			$keys['redirect_uri'] = WB_CALLBACK_URL;
			try {
				$token = $o->getAccessToken( 'code', $keys ) ;
			} catch (OAuthException $e) {
				// Emtpy
			}
		}

		if ($token) {
			SESSION::put("weibo_token", $token["access_token"]);
			setcookie('weibojs_'.$o->client_id, http_build_query($token));
		}

		return $token;
	}

	static function weiboClient() {
		include_once( 'saetv2.ex.class.php');
		return new SaeTClientV2(WB_AKEY, WB_SKEY, SESSION::get("weibo_token"));
	}
}