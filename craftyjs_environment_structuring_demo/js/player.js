const player_match = (ele) => ele.x == gv.player.x && ele.y == gv.player.y;
function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}
function getStationByLocation(x, y) {
  return Object.keys(gv.stations).find(
    (key) => gv.stations[key].x === x && gv.stations[key].y === y
  );
}
function checkCollision() {
  return (
    Object.values(gv.stations).some(player_match) ||
    (player_match(gv.base) && Crafty("Base").get()[0] != undefined)
  );
}
function get_gv_stations() {
  var temparr = {};
  for (var key in gv.stations) {
    temparr["station" + key] = { x: gv.stations[key].x, y: gv.stations[key].y };
  }
  return temparr;
}
// Contains the Player component. May need to change the initial position and the end position once info is added
Crafty.c("Player", {
  init: function () {
    this.requires("2D, DOM, Color, Keyboard, Collision, Tween")
      .attr({
        x: gs.unit_size * (gv.player.x + 5.11),
        y: gs.unit_size * (gv.player.y + 0.45),
        w: gs.unit_size * 0.95,
        h: gs.unit_size * 0.95,
        rotation: 0,
        rotated: false,
        z: 15,
      })
      .setName("player")
      .color("red") //#fa8072
      .origin(0, 0)

      // define player movement
      .bind("KeyDown", function (e) {
        if (e.key == Crafty.keys.LEFT_ARROW && gv.player.x > 0) {
          this.x -= gs.unit_size;
          // this.tween({x: this.x - gs.unit_size}, 100)
          gv.player.x -= 1;
          gv.steps_taken += 1;
          if (checkCollision() == false) {
            if (gv.move_station == true) {
              gv.stations[gv.selected_station_num].e.x -= gs.unit_size;
              gv.stations[gv.selected_station_num].x -= 1;
              gv.steps_taken += gs.move_station_cost; // move both self and station
            } else if (gv.move_base == true) {
              Crafty("Base").x -= gs.unit_size;
              gv.base.x -= 1;
              gv.steps_taken += gs.move_base_cost; // move both self and base
            }
          } else {
            if (gv.move_base == true || gv.move_station == true) {
              this.x += gs.unit_size;
              gv.player.x += 1;
              gv.steps_taken -= 1;
            }
          }
        } else if (
          e.key == Crafty.keys.RIGHT_ARROW &&
          gv.player.x < gs.num_columns - 1
        ) {
          this.x += gs.unit_size;
          gv.player.x += 1;
          gv.steps_taken += 1;
          if (checkCollision() == false) {
            if (gv.move_station == true) {
              gv.stations[gv.selected_station_num].e.x += gs.unit_size;
              gv.stations[gv.selected_station_num].x += 1;
              gv.steps_taken += gs.move_station_cost;
            } else if (gv.move_base == true) {
              Crafty("Base").x += gs.unit_size;
              gv.base.x += 1;
              gv.steps_taken += gs.move_base_cost;
            } else {
            }
          } else {
            if (gv.move_base == true || gv.move_station == true) {
              this.x -= gs.unit_size;
              gv.player.x -= 1;
              gv.steps_taken -= 1;
            }
          }
        } else if (e.key == Crafty.keys.UP_ARROW && gv.player.y > 0) {
          this.y -= gs.unit_size * 1.03;
          gv.player.y -= 1;
          gv.steps_taken += 1;
          if (checkCollision() == false) {
            if (gv.move_station == true) {
              gv.stations[gv.selected_station_num].e.y -= gs.unit_size * 1.03;
              gv.stations[gv.selected_station_num].y -= 1;
              gv.steps_taken += gs.move_station_cost;
            } else if (gv.move_base == true) {
              Crafty("Base").y -= gs.unit_size * 1.03;
              gv.base.y -= 1;
              gv.steps_taken += gs.move_base_cost;
            } else {
            }
          } else {
            if (gv.move_base == true || gv.move_station == true) {
              this.y += gs.unit_size * 1.03;
              gv.player.y += 1;
              gv.steps_taken -= 1;
            }
          }
        } else if (
          e.key == Crafty.keys.DOWN_ARROW &&
          gv.player.y < gs.num_rows - 1
        ) {
          this.y += gs.unit_size * 1.03;
          gv.player.y += 1;
          gv.steps_taken += 1;
          if (checkCollision() == false) {
            if (gv.move_station == true) {
              gv.stations[gv.selected_station_num].e.y += gs.unit_size * 1.03;
              gv.stations[gv.selected_station_num].y += 1;
              gv.steps_taken += gs.move_station_cost;
            } else if (gv.move_base == true) {
              Crafty("Base").y += gs.unit_size * 1.03;
              gv.base.y += 1;
              gv.steps_taken += gs.move_base_cost;
            } else {
            }
          } else {
            if (gv.move_base == true || gv.move_station == true) {
              this.y -= gs.unit_size * 1.03;
              gv.player.y -= 1;
              gv.steps_taken -= 1;
            }
          }
          // collect ingredients
        } else if (
          e.key == Crafty.keys.SPACE &&
          this.hit("Station") != null &&
          gv.current_capacity < gs.max_capacity &&
          gv.move_station == false &&
          gv.move_base == false
        ) {
          gv.ingredients_on_hand[
            "station" + this.hit("Station")[0].obj.ind
          ] += 1;
          gv.current_capacity += 1;
          gv.capacity_circs[gs.max_capacity - gv.current_capacity].destroy();
          // deposit ingredients
        } else if (
          e.key == Crafty.keys.SPACE &&
          this.hit("Base") != null &&
          gv.move_station == false &&
          gv.move_base == false
        ) {
          for (var i = 0; i < gs.num_stations; i++) {
            gv.ingredients_in_base["station" + i] +=
              gv.ingredients_on_hand["station" + i];
            gv.ingredients_on_hand["station" + i] = 0;
          }
          gv.current_capacity = 0;
          Crafty("Base").trigger("reloadCapacity");
          // select/deselect station
        } else if (
          e.key == Crafty.keys.X &&
          gv.player.can_move_station == true &&
          gv.current_capacity == 0 &&
          Crafty("Station").get()[0] != undefined
        ) {
          gv.move_station = !gv.move_station;
          gv.selected_station_num = gv.player.avaliable_station_num;
        } else if (
          e.key == Crafty.keys.X &&
          gv.player.can_move_base == true &&
          gv.current_capacity == 0 &&
          Crafty("Base").get()[0] != undefined
        ) {
          gv.move_base = !gv.move_base;
        }

        // Check movement avaliability
        if (checkCollision() == false) {
          if (this.rotated == true) {
            this.w = gs.unit_size * 0.95;
            this.h = gs.unit_size * 0.95;
            this.x -= (gs.unit_size * 0.95) / 2;
            this.rotation = 0;
          }
          this.rotated = false;

          gv.player.can_move_base = false;
          gv.player.can_move_station = false;
          gv.player.avaliable_station_num = -1;
        } else {
          if (this.rotated == false) {
            this.w = (gs.unit_size * 0.95) / 1.415;
            this.h = (gs.unit_size * 0.95) / 1.415;
            this.x += (gs.unit_size * 0.95) / 2;
            this.rotation = 45;
          }
          this.rotated = true;

          if (gv.current_capacity != 0) {
            gv.player.can_move_base = false;
            gv.player.can_move_station = false;
            gv.player.avaliable_station_num = -1;
          } else if (player_match(gv.base)) {
            gv.player.can_move_base = true;
            gv.player.can_move_station = false;
            gv.player.avaliable_station_num = -1;
          } else if (Object.values(gv.stations).some(player_match)) {
            gv.player.can_move_station = true;
            gv.player.can_move_base = false;
            gv.player.avaliable_station_num = this.hit("Station")[0]
              .obj.getName()
              .slice(-1);
          }
        }
        gs.on_finish(
          getKeyByValue(Crafty.keys, e.key),
          "button_press",
          get_gv_stations()
        );
      });
  },
});
