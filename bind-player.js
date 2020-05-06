// ==UserScript==
// @name         player-bind
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @run-at       document-end
// @resource	 customCSS 
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require		 https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js
// @match        http://sokker.org/player/PID/*
// @grant       GM_addStyle
// ==/UserScript==

$('head').append (
    '<link '
  + 'href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css" '
  + 'rel="stylesheet" type="text/css">'
);

(function() {

    'use strict';

	const MAIL_LINK = 'mailbox/#show/none/newmail/';
    const API_URL = 'https://sokker.org/xml/';
    const API_LOGIN = 'https://sokker.org/xmlinfo.php';

	function applyCss() {
		let css = ".mailButton { color: white; padding: 10px 22px; display: inline-block; font-size: 12px; cursor: pointer; text-decoration: underline;}";
		css += ".buttonGroup { text-align: right; height:35px; font-weight: bold; background: linear-gradient(to bottom,#5d9634,#5d9634 50%,#538c2b 50%,#538c2b); }";
        css += ".loginButton { padding: 10px 22px; font-size: 12px; display: inline-block; text-decoration: underline; color: #FFFFF0 }";

		let style = document.createElement("style");
		style.type = "text/css";
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);
	}

	function getPlayer() {
         if (isOldDesign()) {
             return $('.topContent > h1').text();
         } else {
		    return $('.navbar-brand').text();
        }
	}

	function createMailButtons(xml) {

        const loginElem = xml.getElementsByTagName('user');
        let owner = null;
        if(loginElem !== null) {
            owner = loginElem[0].getElementsByTagName('login')[0].textContent
        }
		
		if(owner == null) {
			return false;
		}

		let query = "?owner=" + owner + "&player=" + getPlayer() + "&lang=";
        const link = MAIL_LINK + query;
        const $content = getContainer();
		const buttonGroup = "<div class='buttonGroup'></div>";
		$content.append(buttonGroup);

		const $buttonGroup = $content.find('.buttonGroup');
		$buttonGroup.append('<a class="loginButton" data-toggle="modal" data-target="#myModal">Configure Mail</a>');
		var buttonRO = "<a href='" + link + "RO' class='mailButton'>RO MAIL</a>";
		var buttonEN = "<a href='" + link + "EN' class='mailButton'>EN MAIL</a>";
		$buttonGroup.append(buttonRO, buttonEN);

		return false;
	}

    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    function checkSession () {
        return getCookie('XMLSESSID');
    }

	function fetchTeam() {

		const teamURL = $('a[href^="team/teamID/"]').attr('href');
        const teamID = teamURL.replace( /^\D+/g, '');
        const url = API_URL + 'team-' + teamID + '.xml';

		fetch(url)
		.then(response => response.text())
        .then(xmlString => $.parseXML(xmlString))
        .then(data => createMailButtons(data))
        .catch(err => {
			console.log(err);
			login();
		});
	}

    function isOldDesign() {
        return $('#centerBox').length > 0;
    }

    function getContainer() {
        if (isOldDesign()) {
            return $('.mainContainer .content').first();
        } else {
            return $('.panel-body .media').first();
        }
    }

    function login() {

        const $container = getContainer();
		const buttonGroup = "<div class='buttonGroup'></div>";
        $container.append(buttonGroup);

        const $buttonGroup = $container.find('.buttonGroup');
		var buttonLogin = "<a href='" + API_LOGIN + "' target='_blank' class='loginButton'>Please login</a>";
		$buttonGroup.append('<a class="loginButton" data-toggle="modal" data-target="#myModal">Configure Mail</a>');
		$buttonGroup.append(buttonLogin);
    }

	function main() {
        applyCss();
        const session = checkSession();
        if (session) {
            fetchTeam();
        } else {
            login();
        }
		addModal();
	};

	main();
})();

function addModal() {
	$('body').append(`
		
		<div class="modal fade" id="myModal" role="dialog">
			<div class="modal-dialog">
			
			  <!-- Modal content-->
			  <div class="modal-content">
				<div class="modal-header">
				  <button type="button" class="close" data-dismiss="modal">&times;</button>
				  <h4 class="modal-title">Configure Mail</h4>
				</div>
				<div class="modal-body">
				  <div class="form-group">
					  <label for="exampleFormControlTextarea2">RO version</label>
					  <textarea class="form-control rounded-0" id="textRo" rows="3"></textarea>
				  </div>
				   <div class="form-group">
					  <label for="exampleFormControlTextarea2">EN version</label>
					  <textarea class="form-control rounded-0" id="textEN" rows="3"></textarea>
				  </div>
				  <p>You can use <i>[player]</i> statement in your message. This will be replaced by the player name.</p>
				</div>
				<div class="modal-footer" style="text-align:center">
				  <button type="button" class="btn btn-primary btn-md" style="width:20%">Save</button>
				</div>
			  </div>
			  
			</div>
		</div>
	
	`);
}
