// ==UserScript==
// @name         player-bind
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @run-at       document-end
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @match        http://sokker.org/player/PID/*
// @grant        none
// ==/UserScript==


(function() {

    'use strict';

	const MAIL_LINK = 'mailbox/#show/none/newmail/';
    const API_URL = 'http://sokker.org/xml/';
    const API_LOGIN = 'http://sokker.org/xmlinfo.php';

	function applyCss() {
		let css = ".mailButton { margin: 10px; background-color: #f44336; color: white; padding: 10px 22px; display: inline-block; font-size: 12px; cursor: pointer}";
		css+= ".mailButton:last-child { background-color: #008CBA; }";
		css += ".buttonGroup { text-align: right; }";
        css += ".loginButton { padding: 10px 22px; font-size: 12px; text-decoration: underline; }";

		let style = document.createElement("style");
		style.type = "text/css";
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);
	}

	function getPlayer() {
		return $('.topContent > h1').text();
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
        const $content = $('.mainContainer .content').first();
		const buttonGroup = "<div class='buttonGroup'></div>";
		$content.append(buttonGroup);

		const $buttonGroup = $content.find('.buttonGroup');
		var buttonRO = "<a href='" + link + "RO' class='mailButton'>RO</a>";
		var buttonEN = "<a href='" + link + "EN' class='mailButton'>EN</a>";
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
		});
	}

    function login() {
        const $content = $('.mainContainer .content').first();
		const buttonGroup = "<div class='buttonGroup'></div>";
        $content.append(buttonGroup);

        const $buttonGroup = $content.find('.buttonGroup');
		var buttonLogin = "<a href='" + API_LOGIN + "' target='_blank' class='loginButton'>Please login</a>";
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
	};

	main();
})();
