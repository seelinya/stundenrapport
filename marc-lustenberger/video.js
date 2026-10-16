/* Video-Kacheln: mit YouTube-ID (data-yt) wird das Video beim Klick eingebettet,
   ohne ID öffnet sich der Link aus data-fallback (z. B. Instagram). */
(function () {
  "use strict";
  document.querySelectorAll(".vid").forEach(function (v) {
    v.addEventListener("click", function () {
      var id = v.getAttribute("data-yt");
      if (!id) { window.open(v.getAttribute("data-fallback"), "_blank", "noopener"); return; }
      var box = document.createElement("div");
      box.className = v.className + " is-playing";
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.title = "Video";
      box.appendChild(f);
      v.replaceWith(box);
    });
  });
})();
