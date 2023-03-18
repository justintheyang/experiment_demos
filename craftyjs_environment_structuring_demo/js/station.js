// Contains the Station component.

Crafty.c("Station", {
  init: function () {
    this.requires("2D, DOM, Color, Collision, Mouse")
      .attr({ w: gs.unit_size * 0.95, h: gs.unit_size * 0.95, z: 4 })
      .color("grey")
      .bind("MouseOver", function () {
        gv.stationInfo = Crafty.e("StationInfo");
        gv.stationInfo.at(this.x, this.y, this.w, this.h);
        gv.stationInfo.inform(this.ind);
        gv.stationInfo.tween({ alpha: 1.0 }, 200);
      })
      .bind("MouseOut", function () {
        // gv.stationInfo.tween({alpha: 0.0}, 50)
        // setTimeout(function() {eval("Crafty('StationInfo').destroy();");}, 50);
        Crafty("StationInfo").destroy();
      });
  },
  // let us initialize station location on instance call
  at: function (x, y, i) {
    this.attr({
      x: (x + 5.11) * gs.unit_size,
      y:
        gs.unit_size *
        (gv_deep.player.y + 0.45 + 1.03 * (y - gv_deep.player.y)), // (y + 0.45)*gs.unit_size*1.03
      ind: i,
    });
    return this;
  },
});

Crafty.c("StationText", {
  init: function () {
    this.requires("2D, DOM, Text")
      .attr({ z: 20 })
      .textFont({ size: "2.1344vh" })
      .textAlign("center")
      .css({ "padding-top": "1.5vh", color: "#f7f7f7" })
      .unselectable();
    // add font styling here!
  },
  // let us initialize station location on instance call
  at: function (x, y) {
    this.attr({
      x: (x + 5.11) * gs.unit_size,
      y:
        gs.unit_size *
        (gv_deep.player.y + 0.45 + 1.03 * (y - gv_deep.player.y)),
      w: gs.unit_size * 0.95,
      h: gs.unit_size * 0.95,
    });
    return this;
  },
});

// figure out a 'extra station information' menu setup
Crafty.c("StationInfo", {
  init: function () {
    this.requires("2D, DOM, Text, Color, Mouse, Tween")
      .attr({
        alpha: 0.0,
        w: gs.unit_size * (Math.floor(gs.num_columns / 2) - 2.4),
        h: gs.unit_size * (Math.floor(gs.num_rows / 2) - 3.3),
        z: 25,
      })
      .color("#dedede")
      .css({
        border: "0.25vh solid #686868",
        "border-radius": "1vh",
        "padding-top": "1vh",
      })
      .textFont({ size: "2.1344vh" })
      .textAlign("center");
  },
  at: function (x, y, w, h) {
    var origin = { _x: x + w / 2, _y: y + h / 2 };
    var distances = [];
    for (var i = 0; i < 4; i++) {
      distances[i] = Crafty.raycast(
        origin,
        rayCastDirections[i]
      ).pop().distance;
    }
    var direction = distances.reduce(
      (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
      0
    );
    if (direction == 0) {
      this.attr({ x: x + gs.unit_size / 1.5, y: y + gs.unit_size * 1.1 });
    } else if (direction == 1) {
      this.attr({
        x: x + gs.unit_size / 1.5,
        y: y - this.h + gs.unit_size * 0.1,
      });
    } else if (direction == 2) {
      this.attr({
        x: x - this.w + gs.unit_size / 1.5,
        y: y - this.h + gs.unit_size * 0.1,
      });
    } else if (direction == 3) {
      this.attr({
        x: x - this.w + gs.unit_size / 1.5,
        y: y + gs.unit_size * 1.1,
      });
    }
  },
  inform: function (ind) {
    this.text(
      "<p><u>Station " +
        ind +
        '</u></p><br><p style="padding-bottom : 0.7vh">' +
        gv.ingredients_in_base["station" + ind] +
        ' ingredients in base</p><p style="padding-bottom : 0.7vh">' +
        gv.ingredients_on_hand["station" + ind] +
        ' ingredients on hand</p><p style="padding-bottom : 0.7vh">' +
        (gv.ingredients_in_base["station" + ind] +
          gv.ingredients_on_hand["station" + ind] +
          ' ingredients collected</p><p style= "padding-bottom : 0.7vh">' +
          gs.total_ingredients_needed[ind] +
          " ingredients needed</p><p>" +
          (Math.abs(gv.stations[ind].x - gv.base.x) +
            Math.abs(gv.stations[ind].y - gv.base.y)) +
          " steps away from base</p>")
    );
  },
});
