/**
 * Scenes can be thought of as different screens in the experiment. We have the following scenes:
 *  - Instructions
 *  - Game
 *  - Ending
 **/

function disable_buttons(timeout) {
  // disable buttons!
  var ents = Crafty("instr_button").get();
  ents[0].attr({ x: (gs.unit_size * (gs.num_columns - 39)) / 2 });
  ents[1].attr({ x: (gs.unit_size * (gs.num_columns - 39)) / 2 });
  setTimeout(function () {
    var ents = Crafty("instr_button").get();
    ents[0].attr({ x: (gs.unit_size * (gs.num_columns + 7)) / 2 });
    ents[1].attr({ x: (gs.unit_size * (gs.num_columns + 11)) / 2 });
  }, timeout);
}

// Instructions will take form as a demo.
Crafty.scene("Instructions", function () {
  var assetsObj = {
    images: ["assets/capacity_circle.png"],
  };
  Crafty.load(assetsObj);

  // Background
  Crafty.background("#e6ecf2"); //#eef7e1
  Crafty.e("Menu");
  // Crafty.e('MenuButton')
  gv.isInstr = true;
  //#region Sidebars
  // create left and right sidebars
  this.left_sidebar = Crafty.e("2D, DOM, Color, Persist")
    .attr({
      x: 0,
      y: gs.crafty_height * 0.01,
      w: gs.unit_size * 4,
      h: gs.crafty_height * 0.97,
    })
    .css({ border: "0.4945vh solid black", "border-radius": "1.111vh" })
    .color("#E7E0DE");
  this.left_sidebar_text0 = Crafty.e("2D, DOM, Color, Text, Persist")
    .attr({ x: 0, y: 0, w: gs.unit_size * 4, z: 2 })
    .textAlign("center")
    .textFont({ size: "2.5vh", weight: "bold" })
    .css({ "padding-top": "2.408vh", "text-decoration": "underline" })
    .unselectable()
    .text("Game info");

  this.left_sidebar_text1 = Crafty.e("2D, DOM, Color, Text, Persist")
    .attr({ x: 0, y: gs.unit_size * 1.2, w: gs.unit_size * 4, z: 1 })
    .dynamicTextGeneration(true)
    .textAlign("left")
    .textFont({ size: "1.984vh" })
    .css({ "padding-left": "1.488vh" })
    .unselectable()
    .text(function () {
      var ingredients_on_hand_txt = "";
      var ingredients_in_base_txt = "";
      for (var i = 0; i < gs.num_stations; i++) {
        ingredients_on_hand_txt +=
          "Station " +
          i +
          ": " +
          gv.ingredients_on_hand["station" + i] +
          "<br>";
        ingredients_in_base_txt +=
          "Station " +
          i +
          ": " +
          gv.ingredients_in_base["station" + i] +
          "<br>";
      }
      return (
        "Items made: <b>" +
        gv.items_made +
        "</b><br>" +
        "Steps : <b>" +
        gv.steps_taken +
        "</b><br>" +
        "Capacity: <b>" +
        gv.current_capacity +
        "</b><br>" +
        "Moving station?: " +
        gv.move_station +
        "<br>" +
        "Moving base?: " +
        gv.move_base +
        "<br><br>" +
        "<u>ingredients on hand</u> <br><br style='line-height:0.4vh'/>" +
        ingredients_on_hand_txt +
        "<br><u>ingredients in base</u> <br><br style='line-height:0.4vh'/>" +
        ingredients_in_base_txt
      );
    });
  this.left_sidebar
    .attach(this.left_sidebar_text0)
    .attach(this.left_sidebar_text1);
  this.right_sidebar = Crafty.e("2D, DOM, Color, Persist")
    .attr({
      x: gs.unit_size * (gs.num_columns + 6),
      y: gs.crafty_height * 0.01,
      w: gs.unit_size * 4,
      h: gs.crafty_height * 0.97,
    })
    .css({ border: "0.4945vh solid black", "border-radius": "1.111vh" })
    .color("#E7E0DE");
  this.right_sidebar_text0 = Crafty.e("2D, DOM, Color, Text, Persist")
    .attr({
      x: gs.unit_size * (gs.num_columns + 6),
      y: 0,
      w: gs.unit_size * 4,
      z: 2,
    })
    .textAlign("center")
    .textFont({ size: "2.5vh", weight: "bold" })
    .css({ "padding-top": "2.408vh", "text-decoration": "underline" })
    .unselectable()
    .text("Recipes");
  for (var i = 0; i < gs.num_unique_items; i++) {
    gv.recipetxt +=
      "<u><b>Item " +
      i +
      "</b></u> &nbsp |&nbsp need <b>" +
      gs.items_to_win[i] +
      '</b><br><br style="line-height:0.556vh"/>';
    for (var j = 0; j < gs.num_stations; j++) {
      gv.recipetxt +=
        "Station " + j + ": " + gs.recipes["item" + i][j] + "<br>";
    }
    gv.recipetxt += "<br><br>";
  }
  this.right_sidebar_text1 = Crafty.e("2D, DOM, Color, Text, Persist")
    .attr({
      x: gs.unit_size * (gs.num_columns + 6),
      y: gs.unit_size * 1.2,
      w: gs.unit_size * 4,
      z: 2,
    })
    .textAlign("left")
    .textFont({ size: "1.984vh" })
    .css({ "padding-left": "1.488vh" })
    .unselectable()
    .text(gv.recipetxt);
  this.right_sidebar
    .attach(this.right_sidebar_text0)
    .attach(this.right_sidebar_text1);
  //#endregion

  // create instruction text area and buttons
  this.instruction_text = Crafty.e("2D, DOM, Color, Text, instruction_text")
    .attr({
      x: gs.unit_size * 5.5356,
      y: gs.unit_size * (gs.num_rows - 1.75),
      w: gs.unit_size * (gs.num_columns - 1.071),
      z: 20,
    })
    .dynamicTextGeneration(true)
    .unselectable()
    .css({
      "font-size": "2.381vh",
      "font-family": "Courier",
      color: "black",
      "text-align": "center",
    })
    .text(gs.instr_texts[gv.instr_ind]);
  this.instruction_button_left = Crafty.e(
    "2D, DOM, Color, Mouse, Text, instr_button"
  )
    .attr({
      x: (gs.unit_size * (gs.num_columns + 7.02)) / 2,
      y: gs.unit_size * (gs.num_rows - 0.5),
      w: gs.unit_size,
      h: (7 * gs.unit_size) / 16,
      z: 20,
    })
    .text("<")
    .textFont({ size: "1.984vh", weight: "bold" })
    .setName("instr_button_left")
    .css({
      cursor: "pointer",
      border: "0.1984vh solid grey",
      "border-radius": "0.794vh",
      "text-align": "center",
      "padding-top": gs.unit_size * 0.006200626 + "vh",
    })
    //#region backwards-button
    .bind("Click", function () {
      if (gv.instr_ind == 1) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 1.75);
      } else if (gv.instr_ind == 2) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 2.2);
      } else if (gv.instr_ind == 3) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 1.75);
      } else if (gv.instr_ind == 4) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 7.25);
      } else if (gv.instr_ind == 5) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 1.25);
        Crafty("Player").destroy();
      } else if (gv.instr_ind == 6) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 1.25);
        Crafty("Station").destroy();
      } else if (gv.instr_ind == 7) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 2.2);
        Crafty("Base").destroy();
        if (gv.base.x == gv.player.x && gv.base.y == gv.player.y) {
          Crafty("Player").w = gs.unit_size * 0.95;
          Crafty("Player").h = gs.unit_size * 0.95;
          Crafty("Player").x -= (gs.unit_size * 0.95) / 2;
          Crafty("Player").rotation = 0;
          Crafty("Player").rotated = false;
        }
      } else if (gv.instr_ind == 8) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 3.0);
      } else if (gv.instr_ind == 9) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 2.2);
      } else if (gv.instr_ind == 10) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 2.6);
      } else if (gv.instr_ind == 11) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 2.2);
      } else if (gv.instr_ind == 12) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 3.0);
      } else if (gv.instr_ind == 13) {
        gv.instr_ind -= 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 1.75);
      }
    });
  //#endregion
  var disable_length = 4000;
  this.instruction_button_right = Crafty.e(
    "2D, DOM, Color, Mouse, Text, instr_button"
  )
    .attr({
      x: (gs.unit_size * (gs.num_columns + 11.02)) / 2,
      y: gs.unit_size * (gs.num_rows - 0.5),
      w: gs.unit_size,
      h: (7 * gs.unit_size) / 16,
      z: 4,
      z: 20,
    })
    .text(">")
    .textFont({ size: "1.984vh", weight: "bold" })
    .setName("instr_button_right")
    .css({
      cursor: "pointer",
      border: "0.1984vh solid grey",
      "border-radius": "0.794vh",
      "text-align": "center",
      "padding-top": gs.unit_size * 0.006200626 + "vh",
    })
    .bind("Click", function () {
      if (gv.instr_ind == 0) {
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 2.2);
        disable_buttons(disable_length * 0.5);
      } else if (gv.instr_ind == 1) {
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 1.75);
        disable_buttons(disable_length * 0.25);
      } else if (gv.instr_ind == 2) {
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 7.25);
        disable_buttons(disable_length);
      } else if (gv.instr_ind == 3) {
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 1.25);
        disable_buttons(disable_length * 0.25);
      } else if (gv.instr_ind == 4) {
        this.player = Crafty.e("Player");
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        disable_buttons(disable_length);
      } else if (gv.instr_ind == 5) {
        gv.gen_modules((isInstr = true));
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 2.2);
        disable_buttons(disable_length);
      } else if (gv.instr_ind == 6) {
        // create base
        this.base = Crafty.e("Base").setName("base");
        this.base.trigger("reloadCapacity");
        if (gv.base.x == gv.player.x && gv.base.y == gv.player.y) {
          Crafty("Player").w = (gs.unit_size * 0.95) / 1.415;
          Crafty("Player").h = (gs.unit_size * 0.95) / 1.415;
          Crafty("Player").x += (gs.unit_size * 0.95) / 2;
          Crafty("Player").rotation = 45;
          Crafty("Player").rotated = true;
        }
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 3.0);
        disable_buttons(disable_length * 1.25);
      } else if (gv.instr_ind == 7) {
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 2.2);
        disable_buttons(disable_length * 3);
      } else if (gv.instr_ind == 8) {
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 2.6);
        disable_buttons(disable_length);
      } else if (gv.instr_ind == 9) {
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 2.2);
        disable_buttons(disable_length);
      } else if (gv.instr_ind == 10) {
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 3.0);
        disable_buttons(disable_length * 0.5);
      } else if (gv.instr_ind == 11) {
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 1.75);
        disable_buttons(disable_length * 1.5);
      } else if (gv.instr_ind == 12) {
        gv.instr_ind += 1;
        Crafty("instruction_text").text(gs.instr_texts[gv.instr_ind]);
        Crafty("instruction_text").y = gs.unit_size * (gs.num_rows - 1.75);
        disable_buttons(disable_length * 0.5);
      } else if (gv.instr_ind == 13) {
        Crafty.scene("Game");
      }
    });

  this.game_container = Crafty.e("2D, DOM, Color, Collision, Persist")
    .attr({
      x: gs.unit_size * 5, // 0.25 added for border
      y: gs.crafty_height * 0.01,
      w: gs.unit_size * gs.num_columns,
      h: gs.crafty_height * 0.97, // leave 0.01 for top padding, and 0.02 for top/bottom borders
      z: 2,
    })
    .color("#eef7e1")
    .css({ border: "0.4945vh solid black", "border-radius": "0.4945vh" })
    .attach(this.instruction_text)
    .attach(this.instruction_button_left)
    .attach(this.instruction_button_right)
    .setName("Bounding box");
});

Crafty.scene("Game", function () {
  // gs = _.cloneDeep(gs_deep)
  gv = _.cloneDeep(gv_deep);
  gv.isInstr = false;

  // create player
  this.player = Crafty.e("Player");
  // create base
  this.base = Crafty.e("Base").setName("base");
  this.base.trigger("reloadCapacity");
  // create stations
  gv.gen_modules((isInstr = false));
  // create menu
  Crafty.e("Menu");
  Crafty.e("MenuButton");
  // reset increment
  gs.increment = (function (n) {
    return function () {
      n += 1;
      return n;
    };
  })(0);
});

Crafty.scene("EndGame", function () {
  // create instruction text area and buttons
  this.end_text = Crafty.e("2D, DOM, Color, Text")
    .attr({
      x: gs.unit_size * 5.5356,
      y: gs.unit_size * (gs.num_rows - 8.75),
      w: gs.unit_size * (gs.num_columns - 1.071),
      z: 3,
    })
    .unselectable()
    .css({
      "font-size": "2.381vh",
      "font-family": "Courier",
      color: "black",
      "text-align": "center",
    })
    .text(
      "Congratulations! You took " +
        gv.steps_taken +
        " steps. You have finished trial " +
        (gs.trialNum + 1) +
        " of " +
        ts.num_trials +
        "."
    );

  this.end_button = Crafty.e("2D, DOM, Color, Mouse, Text")
    .attr({
      x: (gs.unit_size * (gs.num_columns + 9 - 0.35)) / 2,
      y: gs.unit_size * (gs.num_rows - 7.5),
      w: gs.unit_size * 1.7,
      h: (7 * gs.unit_size) / 16,
      z: 4,
    })
    .textFont({ size: "1.984vh", weight: "bold" })
    .text(gs.trialNum + 1 == ts.num_trials ? "Survey" : "Continue")
    .setName("instr_button_right")
    .css({
      cursor: "pointer",
      border: "0.1984vh solid grey",
      "border-radius": "0.794vh",
      "text-align": "center",
      "padding-top": gs.unit_size * 0.006200626 + "vh",
    })
    .bind("Click", function () {
      if (gs.trialNum + 1 < ts.num_trials) {
        gs.trialNum += 1;
        Crafty.scene("Game");
      } else {
        var user_data = (({
          dbname,
          colname,
          iterationName,
          prolificID,
          studyID,
          sessionID,
          gameID,
        }) => ({
          dbname,
          colname,
          iterationName,
          prolificID,
          studyID,
          sessionID,
          gameID,
        }))(gs);
        sessionStorage.setItem("_user", JSON.stringify(user_data));
        window.location.href = "survey.html";
      }
    });
});
