// ==UserScript==
// @author      Fluted
// @namespace   https://github.com/notfluted
// @name        Discord Currently Playing Game Status Script
// @description Set your own Custom 'currently playing' Discord status! Granted though Discord's websockets.
// @include     https://discordapp.com/*
// @include     https://discordapp.com/activity
// @version     1.9.5
// @grant       GM_unsafeWindow
// @run-at      document-end
// ==/UserScript==

/*
	Discord's Currently Playing Game Status
        Copyright (c) Fluted, 2018 (https://github.com/fluteds)
    
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
	
	N/A: Refreshing Page REMOVES Status and refreshing whilst CONNECTED TO VOICE
	     Doesn't load the script. Disconnect from voice and refresh to re enable 
	     the script.

*/

var real_ws_send = unsafeWindow.WebSocket.prototype.send;
unsafeWindow._dgs_last_status_ = "online";

if (typeof exportFunction == "undefined")
	exportFunction = func => func;

unsafeWindow.WebSocket.prototype.send = exportFunction(function(data) {
	if (unsafeWindow._ws_ != this) {
		unsafeWindow._ws_ = this;
		console.log("Custom Discord Game Status Script: Discord Grabbed A Websocket object through the send() hook:", this);
	}
	var data_tab = JSON.parse(data);
	if (data_tab && data_tab.op == 3) {
		unsafeWindow._dgs_last_status_ = data_tab.d.status;
		data_tab.d.game = unsafeWindow._dgs_game_entry_;
		data = JSON.stringify(data_tab);
	}
	return real_ws_send.call(this, data);
}, unsafeWindow);

(function() {
	'use strict';

	var button_icon = 'http://controllercreator.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/g/l/glossywhite_1.png';
	var game_name = '';

 // Tooltip
  
	function tooltipUI (ev, onoff)
	{
		var t = document.getElementsByClassName("tooltips");
		if (onoff) {
			if (t === null) return;
			var left = 0;
			var obj = ev.currentTarget;
			if (obj)
			{
				var rect = obj.getBoundingClientRect();
				left = rect.left - (game_name ? game_name.length * 1.5 : 0) - rect.width * 1.4;
			}
			t[0].innerHTML = '<div class="tooltip tooltip-top tooltip-black" style="position:fixed; left:' + left + 'px; left:218px; bottom:51px;">' + (game_name && game_name.length > 0 ? 'Game Status: ' + game_name : 'Set Your Game Status') + '</div>';
		} else {
			t[0].innerHTML = '';
		}
	}

	function tooltipUIon  (ev) { return tooltipUI (ev, true);  }
	function tooltipUIoff (ev) { return tooltipUI (ev, false); }

	// UI

	function gameUI ()
	{
		game_name = prompt("What Are You Playing?\nNote: Leaving The Box Empty Removes Status");
		if (game_name === null) return;
		var msg = {"op": 3, "d": {"status": unsafeWindow._dgs_last_status_, "since": 0, "afk": false}};
		msg.d.game = game_name.length > 0 ? {"name": game_name, "type": 0} : null; // 0: playing, 1: streaming, 2: listening, 3: watching, 4+: unknown. N/A: Use other options at own risk, this could be included as a 'Self Bot' which is against Discord's T&C.
		unsafeWindow._dgs_game_entry_ = msg.d.game;
		unsafeWindow._ws_.send(JSON.stringify(msg));
	}

	// Wait For UI
	
	var interval_UI_id = null;
	function interval_UI ()
	{
		var chat = document.getElementsByClassName("chat");
		var channels_wrap = chat && chat[0] && chat[0].parentNode.childNodes;
		if (channels_wrap && channels_wrap.length > 0)
		{
			var buttons = channels_wrap[0].childNodes[1].getElementsByTagName("button");
			if (buttons && buttons.length > 0)
			{
				clearInterval(interval_UI_id);

				buttons = buttons[0].parentNode.parentNode;
				var button = buttons.children[1].cloneNode(true);
				buttons.appendChild(button);
				button.addEventListener("click", gameUI, false);
				button.addEventListener("mouseover", tooltipUIon, false);
				button.addEventListener("mouseout", tooltipUIoff, false);

				var button_button = button.children[0];
				button_button.className += " btn-gamestatus";
				button_button.style = "";

				var style = document.createElement("style");
				var sheet = document.head.appendChild(style).sheet;
				sheet.insertRule(".btn-gamestatus:hover {-webkit-filter: brightness(165%);}", sheet.cssRules.length);
				sheet.insertRule(".btn-gamestatus {opacity: 1; -webkit-filter: brightness(115%); background-size: 18px auto; background-repeat: no-repeat; background-position: center; background-image: url('" + button_icon + "')}", sheet.cssRules.length);
			}
		}
	}
	interval_UI_id = setInterval(interval_UI, 1);
})();
