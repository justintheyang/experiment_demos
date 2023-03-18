function get_gv_stations() {
  var temparr = {};
  for (var key in gv.stations) {
    temparr["station" + key] = { x: gv.stations[key].x, y: gv.stations[key].y };
  }
  return temparr;
}
// contains the item menu component
Crafty.c("MenuItem", {
  init: function () {
    this.requires("2D, DOM, Color, Mouse, Text, Tween, Delay")
      .attr({
        w: gs.unit_size * 1.5,
        h: gs.unit_size * 1.5 - (3 * gs.unit_size) / 8,
        z: 31,
        canClick: false,
        alpha: 0.0,
      })
      .textFont({ size: "4.6948vh" })
      .textAlign("center")
      .css({
        cursor: "pointer",
        border: "0.5vh solid rgba(191, 191, 191, 1)",
        "border-radius": "1vh",
        "padding-top": (3 * gs.unit_size) / 8 + "px",
        "animation-fill-mode": "forwards",
      })
      .color("#c2b6b6")
      .bind("Click", function (e) {
        if (this.canClick) {
          for (var i = 0; i < gs.num_stations; i++) {
            gv.ingredients_in_base["station" + i] -= gs.recipes[this.name][i];
          }
          gv.items_made[this.name.slice(-1)] += 1;
          this.css({ animation: "blinkGreen 0.3s" });
          this.delay(function () {
            this.css({ animation: "" });
          }, 300);

          gv.win_game = true;
          for (var i = 0; i < gs.num_unique_items; i++) {
            if (gv.items_made[i] < gs.items_to_win[i]) {
              gv.win_game = false;
              break;
            }
          }
          if (gv.win_game == true) {
            Crafty.scene("EndGame");
          }
        } else {
          this.css({ animation: "blinkRed 0.3s" });
          this.delay(function () {
            this.css({ animation: "" });
          }, 300);
        }
        gs.on_finish(
          e.eventName,
          "mouse_click",
          get_gv_stations(),
          e.target._text
        );
      });
  },
  setName: function (name) {
    this.name = name;
  },

  at: function (x, y) {
    this.attr({ x: x, y: y });
    return this;
  },
});

Crafty.c("Menu", {
  init: function () {
    this.requires("2D, DOM, Color, Renderable, Tween")
      .attr({
        x: gs.unit_size * 7,
        y: gs.unit_size * (gs.num_rows - 2),
        w: gs.unit_size * 11,
        h: gs.unit_size * 2,
        alpha: 0.0,
        z: 20,
      })
      .color("#e3e1bc")
      .css({ border: "0.58685vh solid grey", "border-radius": "1vh" });
    gv.menuItems = [];

    this.bind("showMenu", function () {
      gv.menuItems = [];
      for (var i = 0; i < gs.num_unique_items; i++) {
        gv.menuItems[i] = Crafty.e("MenuItem");
        gv.menuItems[i].at(
          this.x -
            gs.unit_size * 0.75 +
            ((i + 1) * this.w) / (gs.num_unique_items + 1),
          this.y + gs.unit_size * 0.3
        );
        gv.menuItems[i].setName("item" + i);
        gv.menuItems[i].text(i);
        gv.menuItems[i].tween({ alpha: 1.0 }, 100);
        this.attach(gv.menuItems[i]);
      }
      this.tween({ alpha: 1.0 }, 100);
      this.attr({ z: 30 });
    })
      .bind("hideMenu", function () {
        this.tween({ alpha: 0.0 }, 100);
        for (var i = 0; i < gs.num_unique_items; i++) {
          gv.menuItems[i].tween({ alpha: 0.0 }, 100);
        }
        setTimeout(function () {
          eval("Crafty('MenuItem').destroy();");
        }, 100);
        this.attr({ z: 0 });
      })
      .bind("UpdateFrame", function () {
        // control border color and clickability
        this.canGetItem = [];
        for (var i = 0; i < gs.num_unique_items; i++) {
          this.canGetItem[i] = true;
          for (var j = 0; j < gs.num_stations; j++) {
            if (
              gv.ingredients_in_base["station" + j] < gs.recipes["item" + i][j]
            ) {
              this.canGetItem[i] = false;
            }
          }
          if (typeof gv.menuItems[0] != "undefined") {
            gv.menuItems[i].canClick = this.canGetItem[i];
          }
        }
      });
  },
});

Crafty.c("MenuButton", {
  init: function () {
    this.requires("2D, DOM, Color, Tween, Text, Mouse")
      .attr({
        x: gs.unit_size * 5.35,
        y: gs.crafty_height * 0.04,
        w: gs.unit_size * 1.3,
        h: gs.unit_size / 2.2,
        z: 15,
        alpha: 0.0,
        clicked: false,
      })
      .textFont({ size: "2.3474vh" })
      .textAlign("center")
      .text("menu")
      .css({
        cursor: "pointer",
        border: "0.5vh solid rgba(191, 191, 191, 1)",
        "border-radius": "2vh",
        "animation-fill-mode": "forwards",
      })
      .color("#c2b6b6")
      .bind("Click", function () {
        this.clicked = !this.clicked;
        if (this.clicked) {
          Crafty("Menu").trigger("showMenu");
          this.css({ border: "0.5vh solid #5bb061" });
        } else {
          Crafty("Menu").trigger("hideMenu");
          this.css({ border: "0.5vh solid rgba(191, 191, 191, 1)" });
        }
      })
      .bind("showButton", function () {
        this.tween({ alpha: 1.0 }, 100);
      })
      .bind("hideButton", function () {
        this.tween({ alpha: 0.0 }, 100);
      });
  },
});
