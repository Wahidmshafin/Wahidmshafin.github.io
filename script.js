/* =====================================================
   Wahid Mahmood — portfolio behaviour
   No dependencies. Everything degrades if JS is off.
   ===================================================== */

(function () {
	'use strict';

	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------------------------------------------------
	   Small helpers
	--------------------------------------------------- */
	function $(sel, root) { return (root || document).querySelector(sel); }
	function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

	var toastEl = $('#toast');
	var toastTimer;

	function toast(message) {
		if (!toastEl) return;
		toastEl.textContent = message;
		toastEl.classList.add('is-visible');
		clearTimeout(toastTimer);
		toastTimer = setTimeout(function () {
			toastEl.classList.remove('is-visible');
		}, 2200);
	}

	function copyText(text, okMessage) {
		var done = function () { toast(okMessage); };
		var fail = function () { toast('Copy failed — select the text manually.'); };

		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(text).then(done, fail);
			return;
		}
		// fallback for older / non-secure contexts
		var ta = document.createElement('textarea');
		ta.value = text;
		ta.setAttribute('readonly', '');
		ta.style.position = 'fixed';
		ta.style.opacity = '0';
		document.body.appendChild(ta);
		ta.select();
		try { document.execCommand('copy') ? done() : fail(); } catch (e) { fail(); }
		document.body.removeChild(ta);
	}

	/* ---------------------------------------------------
	   Footer year
	--------------------------------------------------- */
	var yearEl = $('#year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	/* ---------------------------------------------------
	   Theme: system default, user choice wins, remembered
	--------------------------------------------------- */
	var themeToggle = $('#theme-toggle');
	var storage = (function () {
		try {
			var k = '__t';
			window.localStorage.setItem(k, k);
			window.localStorage.removeItem(k);
			return window.localStorage;
		} catch (e) { return null; }
	})();

	function applyTheme(theme) {
		document.documentElement.setAttribute('data-theme', theme);
		if (themeToggle) {
			themeToggle.setAttribute(
				'aria-label',
				theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
			);
		}
	}

	var saved = storage ? storage.getItem('theme') : null;
	var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	applyTheme(saved || (prefersDark ? 'dark' : 'light'));

	if (themeToggle) {
		themeToggle.addEventListener('click', function () {
			var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
			applyTheme(next);
			if (storage) storage.setItem('theme', next);
		});
	}

	/* ---------------------------------------------------
	   Mobile menu
	--------------------------------------------------- */
	var menuBtn = $('#menu-btn');
	var siteNav = $('#site-nav');

	function closeMenu() {
		if (!menuBtn || !siteNav) return;
		menuBtn.setAttribute('aria-expanded', 'false');
		menuBtn.setAttribute('aria-label', 'Open menu');
		siteNav.classList.remove('is-open');
	}

	if (menuBtn && siteNav) {
		menuBtn.addEventListener('click', function () {
			var open = menuBtn.getAttribute('aria-expanded') === 'true';
			menuBtn.setAttribute('aria-expanded', String(!open));
			menuBtn.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
			siteNav.classList.toggle('is-open', !open);
		});
		$$('.nav-link', siteNav).forEach(function (link) {
			link.addEventListener('click', closeMenu);
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') closeMenu();
		});
	}

	/* ---------------------------------------------------
	   Scroll spy — highlights the section being read
	--------------------------------------------------- */
	var navLinks = $$('.nav-link');
	var sections = navLinks
		.map(function (link) { return document.querySelector(link.getAttribute('href')); })
		.filter(Boolean);

	if ('IntersectionObserver' in window && sections.length) {
		var spy = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				navLinks.forEach(function (link) {
					link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
				});
			});
		}, { rootMargin: '-45% 0px -50% 0px' });

		sections.forEach(function (section) { spy.observe(section); });
	}

	/* ---------------------------------------------------
	   Scroll reveal
	--------------------------------------------------- */
	var revealTargets = $$('.section-label, .section-title, .section-intro, .prose, .facts, .pub, .thesis, .role, .proj, .mini-list, .skill-group, .award-list li, .ref-list li, .contact-card, .about-portrait');

	if ('IntersectionObserver' in window && !reduceMotion) {
		revealTargets.forEach(function (el) { el.classList.add('reveal'); });
		var revealer = new IntersectionObserver(function (entries, obs) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				entry.target.classList.add('is-in');
				obs.unobserve(entry.target);
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
		revealTargets.forEach(function (el) { revealer.observe(el); });
	}

	/* ---------------------------------------------------
	   Copy: BibTeX + email
	--------------------------------------------------- */
	var BIBTEX = {
		nsnunet:
			'@inproceedings{mahmood2024nsnunet,\n' +
			'  title     = {NSNUNet: A Neighbourhood Attention Based Siamese Nested UNet for Change Detection using Satellite Images},\n' +
			'  author    = {Mahmood, Wahid and Joty, Taslima and Ahsan, Sk. Md. Masudul},\n' +
			'  booktitle = {2024 27th International Conference on Computer and Information Technology (ICCIT)},\n' +
			'  year      = {2024},\n' +
			'  publisher = {IEEE},\n' +
			'  doi       = {10.1109/ICCIT64611.2024.11022454}\n' +
			'}',
		compas:
			'@inproceedings{mahmood2024semisupervised,\n' +
			'  title     = {A Semi-Supervised Approach for Detecting Agricultural Land Reduction in Bangladesh Using Satellite Images},\n' +
			'  author    = {Mahmood, Wahid and Ahsan, Sk. Md. Masudul},\n' +
			'  booktitle = {2024 International Conference on Computing, Communication, and Intelligent Systems (COMPAS)},\n' +
			'  year      = {2024},\n' +
			'  publisher = {IEEE},\n' +
			'  doi       = {10.1109/COMPAS60761.2024.10795941}\n' +
			'}'
	};

	$$('[data-bibtex]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var entry = BIBTEX[btn.getAttribute('data-bibtex')];
			if (entry) copyText(entry, 'BibTeX copied to clipboard');
		});
	});

	var copyEmailBtn = $('#copy-email');
	if (copyEmailBtn) {
		copyEmailBtn.addEventListener('click', function () {
			copyText(copyEmailBtn.getAttribute('data-email'), 'Email address copied');
		});
	}

	/* ---------------------------------------------------
	   Signature: change-detection viewer
	   Draws two synthetic parcel maps sharing one geometry,
	   then reveals the difference behind a draggable split.
	--------------------------------------------------- */
	var frame = $('#cd-frame');
	var beforeLayer = $('#cd-before');
	var afterLayer = $('#cd-after');
	var range = $('#cd-range');
	var deltaEl = $('#cd-delta');

	if (frame && beforeLayer && afterLayer && range) {
		buildChangeMap();
		bindSlider();
	}

	function mulberry32(seed) {
		return function () {
			seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
			var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function buildChangeMap() {
		var W = 640, H = 480;
		var rand = mulberry32(20240914);

		var CROP = ['#3f7f4f', '#4c8f56', '#5b9a5c', '#6ba368', '#7ba875', '#8bb07a', '#a3b97f', '#5f8f5a'];
		var BUILT = ['#b8536e', '#c25f78', '#a94a63', '#cf7189', '#9d4459'];
		var WATER = '#3d6d85';
		var ROAD = '#e8e4dd';

		// irregular field grid
		var cols = [], rows = [], x = 0, y = 0;
		while (x < W) { var w = 42 + rand() * 68; cols.push([x, Math.min(x + w, W)]); x += w; }
		while (y < H) { var h = 40 + rand() * 60; rows.push([y, Math.min(y + h, H)]); y += h; }

		// a growth centre: conversion clusters around it, the way towns actually spread
		var cx = W * 0.68, cy = H * 0.38;
		var maxDist = Math.sqrt(W * W + H * H) * 0.55;

		var beforeCells = [], afterCells = [], changed = 0, total = 0;

		rows.forEach(function (r) {
			cols.forEach(function (c) {
				total++;
				var j = function () { return (rand() - 0.5) * 5; };
				var pts = [
					[c[0] + j(), r[0] + j()],
					[c[1] + j(), r[0] + j()],
					[c[1] + j(), r[1] + j()],
					[c[0] + j(), r[1] + j()]
				].map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');

				var cropFill = CROP[Math.floor(rand() * CROP.length)];
				beforeCells.push('<polygon points="' + pts + '" fill="' + cropFill + '"/>');

				var mx = (c[0] + c[1]) / 2, my = (r[0] + r[1]) / 2;
				var dist = Math.sqrt((mx - cx) * (mx - cx) + (my - cy) * (my - cy));
				var chance = 0.8 - (dist / maxDist);
				var flips = rand() < chance;

				if (flips) { changed++; }
				afterCells.push(
					'<polygon points="' + pts + '" fill="' +
					(flips ? BUILT[Math.floor(rand() * BUILT.length)] : cropFill) + '"/>'
				);
			});
		});

		var river =
			'<path d="M-10 96 C 120 132, 190 60, 300 108 S 500 190, 660 150" ' +
			'fill="none" stroke="' + WATER + '" stroke-width="13" stroke-linecap="round" opacity=".95"/>';

		var roadsBefore =
			'<path d="M0 372 L640 336" fill="none" stroke="' + ROAD + '" stroke-width="5" opacity=".8"/>';

		var roadsAfter = roadsBefore +
			'<path d="M418 0 L392 480" fill="none" stroke="' + ROAD + '" stroke-width="4" opacity=".75"/>' +
			'<path d="M392 210 L640 246" fill="none" stroke="' + ROAD + '" stroke-width="3" opacity=".65"/>';

		var grain =
			'<rect width="' + W + '" height="' + H + '" fill="url(#cdGrain)" opacity=".16"/>';

		var defs =
			'<defs>' +
			'<filter id="cdNoise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/>' +
			'<feColorMatrix type="saturate" values="0"/></filter>' +
			'<pattern id="cdGrain" width="' + W + '" height="' + H + '" patternUnits="userSpaceOnUse">' +
			'<rect width="' + W + '" height="' + H + '" filter="url(#cdNoise)"/></pattern>' +
			'</defs>';

		function svg(cells, roads) {
			return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" ' +
				'xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">' +
				defs + cells.join('') + river + roads + grain + '</svg>';
		}

		beforeLayer.innerHTML = svg(beforeCells, roadsBefore);
		afterLayer.innerHTML = svg(afterCells, roadsAfter);

		if (deltaEl) {
			deltaEl.textContent = 'Δ ' + Math.round((changed / total) * 100) + '% of parcels converted';
		}
	}

	function setPosition(value) {
		frame.style.setProperty('--pos', value + '%');
	}

	function bindSlider() {
		range.addEventListener('input', function () { setPosition(range.value); });

		var target = parseFloat(range.value);

		if (reduceMotion) {
			setPosition(target);
			return;
		}

		// opening sweep: the whole map is "before", then the split settles
		setPosition(100);
		var start = null, from = 100, duration = 1100;

		function step(now) {
			if (start === null) start = now;
			var t = Math.min((now - start) / duration, 1);
			var eased = 1 - Math.pow(1 - t, 3);
			setPosition(from + (target - from) * eased);
			if (t < 1) requestAnimationFrame(step);
		}

		setTimeout(function () { requestAnimationFrame(step); }, 450);
	}
})();