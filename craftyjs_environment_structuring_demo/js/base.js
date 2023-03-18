// Contains the Base component.

Crafty.c("Base", {
  init: function () {
    this.requires("2D, DOM, Color, Collision")
      .attr({
        x: gs.unit_size * (gv.base.x + 5.11),
        y: gs.unit_size * (gv.base.y + 0.45),
        w: gs.unit_size * 0.95,
        h: gs.unit_size * 0.95,
        z: 4,
      })
      .color("#9867C5")
      .setName("base")
      .checkHits("Player")
      .bind("HitOn", function () {
        if (gv.display_items == false) {
          gv.display_items = true;
          // Crafty('Menu').trigger('showMenu')
          Crafty.e("MenuButton").trigger("showButton");
        }
      })
      .bind("HitOff", function () {
        if (gv.display_items == true) {
          gv.display_items = false;
          // Crafty('Menu').trigger('hideMenu')
          Crafty("MenuButton").trigger("hideButton");
          if (Crafty("MenuButton").clicked == true) {
            Crafty("Menu").trigger("hideMenu");
          }
          setTimeout(function () {
            eval("Crafty('MenuButton').destroy();");
          }, 500);
          // Crafty('Menu').tween({alpha: 0.0}, 500);
          // Crafty('MenuItem').destroy();
        }
      })
      .bind("reloadCapacity", function () {
        Crafty("Circle").destroy();
        var j = 0;
        gv.capacity_circs = [0, 0, 0, 0, 0];
        for (var i = 0; i < gs.max_capacity - gv.current_capacity; i++) {
          setTimeout(function timer() {
            gv.capacity_circs[j] = Crafty.e("Circle");
            gv.capacity_circs[j].set_x(j);
            gv.capacity_circs[j].tween({ alpha: 1.0 }, 140);
            j++;
          }, i * 48);
        }
      });
  },
});

Crafty.c("Circle", {
  init: function () {
    this.requires("2D, DOM, Image, Tween, Collision")
      .attr({
        x: gs.unit_size * (gs.num_rows + 2.6),
        y: gs.crafty_height * 0.04,
        z: 20,
        alpha: 0.0,
      })
      .image("assets/capacity_circle.png")
      .checkHits("Collision")
      .bind("HitOn", function () {
        this.tween({ alpha: 0.6 }, 200);
      })
      .bind("HitOff", function () {
        this.tween({ alpha: 1.0 }, 200);
      });
  },
  set_x: function (idx) {
    this.attr({ x: gs.unit_size * (gs.num_rows + 4.4 - 0.45 * idx) });
  },
});
